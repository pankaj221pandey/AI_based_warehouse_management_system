from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import json
import os
from datetime import datetime
import logging
from typing import List, Optional
import openai
from pydantic import BaseModel
import asyncio
from prisma import Prisma

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="WMS API", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Prisma client
prisma = Prisma()

# Pydantic models
class ProductCreate(BaseModel):
    sku: str
    msku: Optional[str] = None
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    cost: Optional[float] = None

class OrderCreate(BaseModel):
    order_number: str
    customer_name: Optional[str] = None
    order_date: datetime
    total_amount: float
    status: str = "pending"
    marketplace: Optional[str] = None

class SalesDataCreate(BaseModel):
    date: datetime
    quantity: int
    revenue: float
    cost: Optional[float] = None
    profit: Optional[float] = None
    marketplace: Optional[str] = None
    product_id: str
    order_id: Optional[str] = None

class AIQuery(BaseModel):
    query: str
    chart_type: Optional[str] = None
    openai_key: Optional[str] = None

# Database connection
@app.on_event("startup")
async def startup():
    await prisma.connect()

@app.on_event("shutdown")
async def shutdown():
    await prisma.disconnect()

# Health check endpoint
@app.get("/")
async def root():
    return {"message": "WMS API is running"}

# Product endpoints
@app.get("/api/products")
async def get_products():
    """Get all products"""
    try:
        products = await prisma.product.find_many()
        return {"products": products}
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@app.post("/api/products")
async def create_product(product: ProductCreate):
    """Create a new product"""
    try:
        new_product = await prisma.product.create(data=product.dict())
        return {"product": new_product}
    except Exception as e:
        logger.error(f"Error creating product: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating product")

# Upload and data processing endpoints
@app.post("/api/upload")
async def upload_sales_data(file: UploadFile = File(...)):
    """Upload and process sales data CSV"""
    try:
        # Read CSV file
        df = pd.read_csv(file.file)
        
        # Process the data
        processed_data = await process_sales_data(df)
        
        return {
            "message": "Data uploaded successfully",
            "rows_processed": len(processed_data),
            "sample_data": processed_data[:5]
        }
    except Exception as e:
        logger.error(f"Error processing upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

async def process_sales_data(df: pd.DataFrame):
    """Process sales data and store in database"""
    processed_rows = []
    
    for _, row in df.iterrows():
        try:
            # Extract product information
            sku = str(row.get('sku', row.get('product_sku', '')))
            name = str(row.get('product_name', row.get('name', '')))
            
            # Create or update product
            product = await prisma.product.upsert(
                where={"sku": sku},
                data={
                    "create": {
                        "sku": sku,
                        "name": name,
                        "category": str(row.get('category', '')),
                        "price": float(row.get('price', 0)),
                        "cost": float(row.get('cost', 0))
                    },
                    "update": {
                        "name": name,
                        "price": float(row.get('price', 0)),
                        "cost": float(row.get('cost', 0))
                    }
                }
            )
            
            # Create sales data entry
            sales_data = await prisma.salesdata.create(
                data={
                    "date": datetime.now(),
                    "quantity": int(row.get('quantity', 0)),
                    "revenue": float(row.get('revenue', 0)),
                    "cost": float(row.get('cost', 0)),
                    "marketplace": str(row.get('marketplace', '')),
                    "product_id": product.id
                }
            )
            
            processed_rows.append({
                "sku": sku,
                "name": name,
                "quantity": int(row.get('quantity', 0)),
                "revenue": float(row.get('revenue', 0))
            })
            
        except Exception as e:
            logger.error(f"Error processing row: {str(e)}")
            continue
    
    return processed_rows

# Metrics and dashboard endpoints
@app.get("/api/metrics")
async def get_metrics():
    """Get dashboard metrics"""
    try:
        # Get basic counts
        total_products = await prisma.product.count()
        total_orders = await prisma.order.count()
        total_sales = await prisma.salesdata.count()
        
        # Get revenue metrics (simplified)
        all_sales = await prisma.salesdata.find_many()
        total_revenue = sum(sale.revenue for sale in all_sales) if all_sales else 0
        avg_revenue = total_revenue / len(all_sales) if all_sales else 0
        
        # Get top products (simplified for now)
        top_products = await prisma.salesdata.find_many(
            take=5,
            order=[{"revenue": "desc"}]
        )
        
        return {
            "total_products": total_products,
            "total_orders": total_orders,
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "avg_revenue": avg_revenue,
            "top_products": top_products
        }
    except Exception as e:
        logger.error(f"Error fetching metrics: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching metrics")

# AI-powered query endpoint
@app.post("/api/query")
async def ai_query(query: AIQuery):
    """Process AI-powered natural language queries"""
    try:
        # Initialize OpenAI client
        openai.api_key = query.openai_key or os.getenv("OPENAI_API_KEY")
        
        if not openai.api_key:
            raise HTTPException(status_code=500, detail="OpenAI API key not configured")
        
        # Get database schema information
        schema_info = await get_database_schema()
        
        # Create prompt for SQL generation
        prompt = f"""
        Given the following database schema:
        {schema_info}
        
        And the user query: "{query.query}"
        
        Generate a SQL query to answer this question. Return only the SQL query, nothing else.
        """
        
        # Generate SQL using OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a SQL expert. Generate only SQL queries."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200
        )
        
        sql_query = response.choices[0].message.content.strip()
        
        # Execute the query (with safety checks)
        if is_safe_query(sql_query):
            result = await execute_sql_query(sql_query)
            
            # Generate chart data if requested
            chart_data = None
            if query.chart_type:
                chart_data = generate_chart_data(result, query.chart_type)
            
            return {
                "query": query.query,
                "sql": sql_query,
                "result": result,
                "chart_data": chart_data
            }
        else:
            raise HTTPException(status_code=400, detail="Unsafe query detected")
            
    except Exception as e:
        logger.error(f"Error processing AI query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

async def get_database_schema():
    """Get database schema information for AI queries"""
    return """
    Products table:
    - id: String (primary key)
    - sku: String (unique)
    - msku: String (optional)
    - name: String
    - description: String (optional)
    - category: String (optional)
    - price: Float (optional)
    - cost: Float (optional)
    
    Orders table:
    - id: String (primary key)
    - order_number: String (unique)
    - customer_name: String (optional)
    - order_date: DateTime
    - total_amount: Float
    - status: String
    - marketplace: String (optional)
    
    SalesData table:
    - id: String (primary key)
    - date: DateTime
    - quantity: Integer
    - revenue: Float
    - cost: Float (optional)
    - profit: Float (optional)
    - marketplace: String (optional)
    - product_id: String (foreign key to Products)
    - order_id: String (foreign key to Orders, optional)
    """

def is_safe_query(sql: str) -> bool:
    """Check if SQL query is safe to execute"""
    dangerous_keywords = [
        "DROP", "DELETE", "UPDATE", "INSERT", "CREATE", "ALTER", "TRUNCATE",
        "EXEC", "EXECUTE", "xp_", "sp_"
    ]
    
    sql_upper = sql.upper()
    return not any(keyword in sql_upper for keyword in dangerous_keywords)

async def execute_sql_query(sql: str):
    """Execute SQL query safely"""
    try:
        # For now, return mock data
        # In production, you'd use proper SQL execution
        return {
            "columns": ["Product", "Revenue", "Quantity"],
            "data": [
                ["Product A", 1000.0, 50],
                ["Product B", 800.0, 30],
                ["Product C", 600.0, 25]
            ]
        }
    except Exception as e:
        logger.error(f"Error executing SQL: {str(e)}")
        raise HTTPException(status_code=500, detail="Error executing query")

def generate_chart_data(result: dict, chart_type: str):
    """Generate chart data based on query result"""
    if chart_type == "bar":
        return {
            "type": "bar",
            "labels": [row[0] for row in result["data"]],
            "datasets": [{
                "label": "Revenue",
                "data": [row[1] for row in result["data"]]
            }]
        }
    elif chart_type == "line":
        return {
            "type": "line",
            "labels": [row[0] for row in result["data"]],
            "datasets": [{
                "label": "Revenue",
                "data": [row[1] for row in result["data"]]
            }]
        }
    else:
        return None

# SKU mapping endpoints
@app.get("/api/sku-mappings")
async def get_sku_mappings():
    """Get all SKU mappings"""
    try:
        mappings = await prisma.skumapping.find_many()
        return {"mappings": mappings}
    except Exception as e:
        logger.error(f"Error fetching SKU mappings: {str(e)}")
        raise HTTPException(status_code=500, detail="Error fetching mappings")

@app.post("/api/sku-mappings")
async def create_sku_mapping(sku: str, msku: str, marketplace: Optional[str] = None):
    """Create a new SKU mapping"""
    try:
        mapping = await prisma.skumapping.create(
            data={
                "sku": sku,
                "msku": msku,
                "marketplace": marketplace
            }
        )
        return {"mapping": mapping}
    except Exception as e:
        logger.error(f"Error creating SKU mapping: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating mapping")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 