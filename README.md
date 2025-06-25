# Document Management System

A modern, user-friendly document management system built with Node.js, Express, MongoDB, and EJS. Features include secure authentication, drag-and-drop document upload, full-text search, and statistics.

---

## Features

- **User Authentication**: Secure registration and login with hashed passwords.
- **Document Upload**: Drag-and-drop or select PDF, DOC, or DOCX files.
- **Full-Text Search**: Instantly search your documents by name or content.
- **Statistics**: View document counts and storage usage.
- **Responsive UI**: Clean, modern interface with EJS templates.
- **Role-based Access**: Each user manages their own documents.

---

## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (local or Atlas)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/document-management-system.git
   cd document-management-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory:
     ```
     MONGODB_URI=your_mongodb_connection_string
     SESSION_SECRET=your_session_secret
     NODE_ENV=development
     PORT=3001
     ```

4. **Run the app:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3001`.

---

## Project Structure

```
data-analytics/
  app.js
  config/
    passport.js
  controllers/
    documentController.js
  middleware/
    auth.js
  models/
    Document.js
    User.js
  routes/
    documents.js
    index.js
    users.js
  uploads/
  views/
    dashboard.ejs
    documents/
      index.ejs
      search.ejs
      statistics.ejs
      upload.ejs
      view.ejs
    error.ejs
    index.ejs
    layouts/
      main.ejs
    login.ejs
    register.ejs
    upload.ejs
  package.json
```

---

## Documentation for Each Part

### 1. `app.js` (Main Application Entry)
- Sets up Express, connects to MongoDB, configures session, Passport, flash messages, and EJS view engine.
- Registers all routes and error handling.
- **Start here** if you want to see how the app is bootstrapped.

### 2. `config/passport.js` (Authentication Configuration)
- Configures Passport.js for local authentication using username and password.
- Handles user serialization and deserialization for sessions.

### 3. `controllers/documentController.js` (Document Logic)
- Handles all document-related logic:
  - File upload (with Multer)
  - Text extraction from PDF/DOC/DOCX
  - Saving documents to MongoDB
  - Searching documents by name/content
  - Viewing, classifying, and statistics for documents

### 4. `middleware/auth.js` (Authentication Middleware)
- `ensureAuthenticated`: Protects routes so only logged-in users can access them.
- `forwardAuthenticated`: Redirects logged-in users away from login/register pages.

### 5. `models/User.js` (User Model)
- Mongoose schema for users: username, name, email, hashed password, registration date.

### 6. `models/Document.js` (Document Model)
- Mongoose schema for documents: name, file path, type, size, extracted content, owner, upload date.

### 7. `routes/index.js` (Main & Dashboard Routes)
- `/`: Home page (welcome)
- `/dashboard`: User dashboard (requires login)

### 8. `routes/users.js` (User Routes)
- `/users/login`: Login page and handler
- `/users/register`: Registration page and handler
- `/users/logout`: Logout handler

### 9. `routes/documents.js` (Document Routes)
- `/documents`: List all user documents
- `/documents/upload`: Upload page and handler
- `/documents/search`: Search documents
- `/documents/statistics`: View statistics
- `/documents/:id`: View a single document

### 10. `views/` (EJS Templates)
- **dashboard.ejs**: User dashboard with quick links and recent documents.
- **login.ejs / register.ejs**: User authentication forms.
- **documents/index.ejs**: List of all user documents.
- **documents/upload.ejs**: Drag-and-drop upload form and recent uploads.
- **documents/search.ejs**: Search results.
- **documents/statistics.ejs**: Document statistics (count, size).
- **documents/view.ejs**: View a single document, with search term highlighting.
- **layouts/main.ejs**: Main layout for consistent look and feel.
- **error.ejs**: Error display page.

### 11. `uploads/`
- Stores uploaded files. (Make sure this directory is writable.)

---

## Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

MIT

---

## Friendly Tips

- For development, use `npm run dev` to enable auto-reloading with nodemon.
- Make sure your MongoDB instance is running before starting the app.
- Passwords are securely hashed using bcrypt.
- Only PDF, DOC, and DOCX files are supported for upload.
- Each user can only see and manage their own documents. 