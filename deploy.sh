#!/bin/bash

# AI Meeting Summarizer - Deployment Script
# This script helps deploy the application to various platforms

set -e  # Exit on any error

echo "🚀 AI Meeting Summarizer Deployment Script"
echo "=========================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup environment file
setup_env() {
    if [ ! -f .env ]; then
        echo "📝 Creating .env file..."
        cat > .env << EOL
# Server Configuration
PORT=3000
NODE_ENV=production

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
EOL
        echo "⚠️  Please edit .env file with your actual credentials"
        echo "   - Get Groq API key from: https://console.groq.com/"
        echo "   - Setup Gmail App Password for email functionality"
        read -p "Press Enter after updating .env file..."
    fi
}

# Function to install dependencies
install_deps() {
    echo "📦 Installing dependencies..."
    if command_exists npm; then
        npm install
    elif command_exists yarn; then
        yarn install
    else
        echo "❌ Neither npm nor yarn found. Please install Node.js"
        exit 1
    fi
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    npm run test 2>/dev/null || echo "⚠️  No tests configured (optional)"
}

# Function to deploy to Heroku
deploy_heroku() {
    echo "🎯 Deploying to Heroku..."
    
    if ! command_exists heroku; then
        echo "❌ Heroku CLI not found. Install from: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi
    
    read -p "Enter your Heroku app name: " app_name
    
    # Check if app exists, create if not
    if ! heroku apps:info "$app_name" >/dev/null 2>&1; then
        echo "📱 Creating Heroku app: $app_name"
        heroku create "$app_name"
    fi
    
    # Set environment variables
    echo "⚙️  Setting environment variables..."
    if [ -f .env ]; then
        while IFS= read -r line; do
            if [[ $line == *"="* && $line != "#"* ]]; then
                heroku config:set "$line" --app "$app_name"
            fi
        done < .env
    fi
    
    # Deploy
    echo "🚀 Deploying to Heroku..."
    git add .
    git commit -m "Deploy to Heroku" || echo "No changes to commit"
    git push heroku main || git push heroku master
    
    echo "✅ Deployed to Heroku!"
    echo "🌐 App URL: https://$app_name.herokuapp.com"
}

# Function to deploy to Railway
deploy_railway() {
    echo "🚂 Deploying to Railway..."
    
    if ! command_exists railway; then
        echo "❌ Railway CLI not found. Install with: npm install -g @railway/cli"
        exit 1
    fi
    
    # Login to Railway
    railway login
    
    # Initialize project
    railway init
    
    # Set environment variables
    if [ -f .env ]; then
        echo "⚙️  Setting environment variables..."
        while IFS= read -r line; do
            if [[ $line == *"="* && $line != "#"* ]]; then
                key=$(echo "$line" | cut -d'=' -f1)
                value=$(echo "$line" | cut -d'=' -f2-)
                railway variables set "$key=$value"
            fi
        done < .env
    fi
    
    # Deploy
    echo "🚀 Deploying to Railway..."
    railway up
    
    echo "✅ Deployed to Railway!"
    railway status
}

# Function for VPS deployment
deploy_vps() {
    echo "🖥️  VPS Deployment Guide"
    echo "======================"
    
    cat << EOL

For VPS deployment, follow these steps:

1. Connect to your VPS:
   ssh user@your-server-ip

2. Install Node.js (if not installed):
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

3. Install PM2 for process management:
   sudo npm install -g pm2

4. Clone your repository:
   git clone <your-repo-url>
   cd ai-meeting-summarizer

5. Install dependencies:
   npm install

6. Setup environment variables:
   cp .env.example .env
   nano .env  # Edit with your credentials

7. Start the application:
   pm2 start backend/server.js --name "meeting-summarizer"
   pm2 startup
   pm2 save

8. Setup Nginx reverse proxy (optional):
   sudo apt install nginx
   # Configure nginx to proxy to localhost:3000

9. Setup SSL with Let's Encrypt (optional):
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com

Your app will be available at http://your-server-ip:3000

EOL
}

# Function to build for production
build_production() {
    echo "🏗️  Building for production..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Install only production dependencies
    npm ci --only=production
    
    echo "✅ Production build complete!"
}

# Function to start local server
start_local() {
    echo "🖥️  Starting local development server..."
    setup_env
    install_deps
    
    echo "🌐 Starting server at http://localhost:3000"
    npm run dev
}

# Main menu
show_menu() {
    echo ""
    echo "Select deployment option:"
    echo "1) Local Development"
    echo "2) Heroku"
    echo "3) Railway"
    echo "4) VPS (Instructions)"
    echo "5) Build for Production"
    echo "6) Exit"
    echo ""
}

# Main script logic
main() {
    # Check if Node.js is installed
    if ! command_exists node; then
        echo "❌ Node.js not found. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    echo "Node.js version: $(node --version)"
    echo "NPM version: $(npm --version)"
    echo ""
    
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " choice
        
        case $choice in
            1)
                start_local
                break
                ;;
            2)
                setup_env
                install_deps
                run_tests
                deploy_heroku
                break
                ;;
            3)
                setup_env
                install_deps
                run_tests
                deploy_railway
                break
                ;;
            4)
                deploy_vps
                break
                ;;
            5)
                setup_env
                build_production
                break
                ;;
            6)
                echo "👋 Goodbye!"
                exit 0
                ;;
            *)
                echo "❌ Invalid choice. Please select 1-6."
                ;;
        esac
    done
}

# Run main function
main "$@"