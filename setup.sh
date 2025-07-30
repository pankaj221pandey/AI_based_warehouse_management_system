#!/bin/bash

echo "🚀 Setting up WMS System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://wms_user:wms_password@localhost:5432/wms_db

# OpenAI Configuration (optional - for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Environment
NODE_ENV=development
EOF
    echo "✅ .env file created. Please update with your OpenAI API key if needed."
fi

# Start the database
echo "🐘 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Install backend dependencies
echo "🐍 Installing Python dependencies..."
cd backend
pip install -r requirements.txt

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate dev --name init

cd ..

# Install frontend dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
npm install

cd ..

echo "✅ Setup complete!"
echo ""
echo "🎉 To start the application:"
echo "1. Start all services: docker-compose up -d"
echo "2. Or start individual services:"
echo "   - Backend: cd backend && uvicorn main:app --reload"
echo "   - Frontend: cd frontend && npm start"
echo ""
echo "🌐 Access the application at:"
echo "   - Web App: http://localhost:3000"
echo "   - API: http://localhost:8000"
echo "   - GUI Mapper: python gui/sku_mapper.py"
echo ""
echo "📚 For more information, see the README.md file." 