<<<<<<< HEAD
# AI Meeting Summarizer

A full-stack web application that uses AI to summarize meeting transcripts and share them via email.

## Features

- 📁 **File Upload**: Support for `.txt`, `.text`, and `.md` files (up to 5MB)
- ✏️ **Text Input**: Direct paste functionality for meeting transcripts
- 🤖 **AI-Powered Summarization**: Using Groq API for intelligent summaries
- 🎯 **Custom Prompts**: Tailor summaries with specific instructions
- ✂️ **Editable Summaries**: Edit AI-generated content before sharing
- 📧 **Email Sharing**: Send summaries to multiple recipients
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **Node.js** with Express.js
- **Groq SDK** for AI summarization
- **Multer** for file uploads
- **Nodemailer** for email functionality
- **CORS** for cross-origin requests

### Frontend
- **Vanilla HTML/CSS/JavaScript**
- **Responsive Design** with CSS Grid and Flexbox
- **File Drag & Drop** functionality
- **Real-time character counting**

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Groq API key ([Get one here](https://console.groq.com/))
- Email credentials (Gmail recommended)

### Installation

1. **Clone and setup**:
```bash
git clone <repository-url>
cd ai-meeting-summarizer
npm install
```

2. **Environment Configuration**:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Server
PORT=3000
NODE_ENV=development

# Groq API
GROQ_API_KEY=your_groq_api_key_here

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password_here
```

3. **Run the application**:
```bash
# Development
npm run dev

# Production
npm start
```

4. **Open in browser**: http://localhost:3000

## Project Structure

```
ai-meeting-summarizer/
├── backend/
│   ├── server.js                 # Main server file
│   ├── routes/
│   │   └── api.js               # API routes
│   ├── controllers/
│   │   └── summaryController.js # Business logic
│   ├── middleware/
│   │   └── upload.js           # File upload handling
│   └── config/
│       └── email.js            # Email configuration
├── frontend/
│   ├── index.html              # Main HTML file
│   ├── css/
│   │   └── style.css          # Styling
│   └── js/
│       └── app.js             # Frontend JavaScript
├── uploads/                    # File upload directory
├── docs/
│   └── approach.md            # Development approach
├── package.json
├── .env                       # Environment variables
└── README.md
```

## API Endpoints

### POST `/api/generate-summary`
Generate AI summary from transcript.

**Body**: 
- `transcript` (file or text): Meeting transcript
- `customPrompt` (optional): Custom instructions

**Response**:
```json
{
  "success": true,
  "summary": "Generated summary...",
  "originalLength": 1500,
  "summaryLength": 300,
  "customPrompt": "Custom instructions"
}
```

### POST `/api/share-summary`
Share summary via email.

**Body**:
```json
{
  "recipients": ["email1@example.com", "email2@example.com"],
  "subject": "Meeting Summary",
  "summary": "Summary content...",
  "originalText": "Original transcript...",
  "customPrompt": "Custom instructions"
}
```

### GET `/api/health`
Health check endpoint.

## Deployment

### Option 1: Heroku
1. Create Heroku app: `heroku create your-app-name`
2. Set environment variables: `heroku config:set GROQ_API_KEY=your_key`
3. Deploy: `git push heroku main`

### Option 2: Railway
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically

### Option 3: DigitalOcean App Platform
1. Create app from GitHub
2. Configure environment variables
3. Deploy

### Option 4: VPS/Self-hosted
```bash
# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start backend/server.js --name "meeting-summarizer"

# Setup nginx reverse proxy (optional)
# Configure SSL with Let's Encrypt
```

## Environment Setup

### Getting Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up/Login
3. Create new API key
4. Copy key to `.env` file

### Email Setup (Gmail)
1. Enable 2-Factor Authentication
2. Generate App Password:
   - Google Account Settings → Security → App passwords
   - Generate password for "Mail"
   - Use this password in `.env`

## Usage Examples

### Basic Summarization
1. Upload meeting transcript file or paste text
2. Click "Generate Summary"
3. Review and edit if needed
4. Share via email

### Custom Instructions
- "Summarize in bullet points for executives"
- "Focus only on action items and deadlines"
- "Highlight key decisions and next steps"
- "Extract all follow-up tasks with owners"

## Development

### Running in Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

### File Structure Guidelines
- Keep routes in `/backend/routes/`
- Business logic in `/backend/controllers/`
- Utilities in `/backend/config/`
- Frontend assets in `/frontend/`

### Adding New Features
1. Update API routes in `backend/routes/api.js`
2. Add controller logic in `backend/controllers/`
3. Update frontend in `frontend/js/app.js`
4. Style changes in `frontend/css/style.css`

## Troubleshooting

### Common Issues

**AI Generation Fails**:
- Check Groq API key is correct
- Verify internet connection
- Check API quota/limits

**Email Not Sending**:
- Verify email credentials
- Check Gmail App Password (not regular password)
- Ensure less secure app access is disabled (use App Password)

**File Upload Issues**:
- Check file size (max 5MB)
- Verify file type (.txt, .text, .md)
- Check uploads directory permissions

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## Performance Optimization

### Backend Optimizations
- File upload size limits (5MB)
- Request timeout handling
- Error boundary implementation
- Memory management for large files

### Frontend Optimizations
- Lazy loading for large transcripts
- Debounced input handling
- Efficient DOM manipulation
- Responsive image loading

## Security Features

- File type validation
- File size limits
- Input sanitization
- CORS configuration
- Environment variable protection
- Error message sanitization

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create new issue with detailed description
3. Include error logs and environment details

## Changelog

### v1.0.0
- Initial release
- Basic AI summarization
- File upload support
- Email sharing
- Responsive design
=======
# ai-meeting-summarizer
>>>>>>> 9f978e8f185aed2d34c7c883304272087d18a556
