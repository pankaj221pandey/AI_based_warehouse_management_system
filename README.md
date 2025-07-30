# Warehouse Management System

A comprehensive solution for managing warehouse operations, inventory tracking, and sales data analysis.

## What This App Does

- **Data Management**: Upload and process sales data from multiple marketplaces
- **SKU Mapping**: Map product codes between different systems and marketplaces
- **Analytics Dashboard**: View key business metrics and performance insights
- **AI-Powered Queries**: Ask questions about your data in plain English
- **Inventory Tracking**: Monitor stock levels and product performance

## Getting Started

### Prerequisites
- Docker installed on your computer
- Web browser (Chrome, Firefox, Safari, etc.)

### Quick Setup

1. **Download the application**
   ```bash
   git clone <your-repo-url>
   cd warehouse-management-system
   ```

2. **Start the application**
   ```bash
   docker-compose up -d
   ```
   
3. **Open your browser** and go to:
   - Main Application: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

That's it! The application is now running.

## How to Use

### 1. Upload Your Data
- Go to the "Data Upload" section
- Drag and drop your CSV files containing sales data
- The system will automatically process and clean your data

### 2. Map Your SKUs
- Use the SKU Mapper to connect product codes from different marketplaces
- Set up automatic mapping rules for future uploads
- Handle combo products and variations

### 3. View Your Dashboard
- See real-time metrics about your business
- Track sales performance across different channels
- Monitor inventory levels and trends

### 4. Ask Questions (AI Feature)
Simply type questions like:
- "What are my best-selling products this month?"
- "Show me sales by marketplace"
- "Which products have low inventory?"

## Supported File Formats

- **CSV files** with sales data from:
  - Amazon
  - eBay
  - Shopify
  - Other marketplace platforms
  - Custom formats

## Key Features

- **Easy File Upload**: Drag-and-drop interface
- **Smart Data Processing**: Automatic data cleaning and validation
- **Visual Analytics**: Charts and graphs for better insights
- **Multi-Marketplace Support**: Handle data from various platforms
- **Export Capabilities**: Download processed data and reports

## Need Help?

### Common Questions

**Q: My data isn't showing up correctly**
A: Make sure your CSV file has the correct column headers. Check the sample file format in the app.

**Q: How do I map SKUs from different marketplaces?**
A: Use the SKU Mapper tool to create connections between your internal product codes and marketplace-specific codes.

**Q: Can I export my processed data?**
A: Yes, you can download cleaned data and reports from the dashboard.

### Sample Data
The application includes sample data to help you get started and understand the expected format.

## Stopping the Application

To stop the application:
```bash
docker-compose down
```

## System Requirements

- **RAM**: Minimum 4GB recommended
- **Storage**: At least 2GB free space
- **Internet**: Required for initial setup and AI features

## Updates

To update the application:
1. Stop the current version: `docker-compose down`
2. Pull the latest changes: `git pull`
3. Restart: `docker-compose up -d`

---

**Need technical support?** Contact your system administrator or check the documentation for advanced configuration options.