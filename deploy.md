# 🚀 Deployment Instructions

## Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `blood-testing-platform`
5. Make it **Public** (required for free Netlify)
6. Don't initialize with README (we already have one)
7. Click "Create repository"

## Step 2: Upload Your Code to GitHub

### Option A: Using GitHub Desktop (Easiest)
1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in with your GitHub account
3. Click "Clone a repository from the Internet"
4. Enter your repository URL: `https://github.com/yourusername/blood-testing-platform`
5. Choose a local folder
6. Copy all your project files into the cloned folder
7. In GitHub Desktop, you'll see all your files
8. Add a commit message: "Initial commit - Blood Testing Platform"
9. Click "Commit to main"
10. Click "Push origin" to upload to GitHub

### Option B: Using Command Line
```bash
# Navigate to your project folder
cd C:\Users\adona\Documents\prc

# Initialize git repository
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - Blood Testing Platform"

# Add GitHub repository as remote
git remote add origin https://github.com/yourusername/blood-testing-platform.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Netlify

1. Go to [Netlify.com](https://netlify.com)
2. Click "Sign up" and create account (or sign in)
3. Click "New site from Git"
4. Choose "GitHub" as your Git provider
5. Authorize Netlify to access your GitHub
6. Select your `blood-testing-platform` repository
7. Configure build settings:
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (root directory)
8. Click "Deploy site"
9. Wait for deployment to complete
10. Your site will be live at: `https://random-name-123456.netlify.app`

## Step 4: Custom Domain (Optional)

1. In Netlify dashboard, go to "Domain settings"
2. Click "Add custom domain"
3. Enter your domain name (if you have one)
4. Follow the DNS configuration instructions

## Step 5: Automatic Updates

Every time you make changes:
1. Edit your files locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Updated blood compatibility table"
   git push origin main
   ```
3. Netlify will automatically rebuild and deploy your changes!

## 🔧 Troubleshooting

### If GitHub push fails:
- Make sure you're in the right directory
- Check your GitHub username and repository name
- Try: `git remote -v` to verify the remote URL

### If Netlify deployment fails:
- Check the build logs in Netlify dashboard
- Make sure all files are in the root directory
- Verify `index.html` exists in the root

### If the site doesn't work:
- Check browser console for errors (F12)
- Make sure all file paths are correct
- Verify JavaScript is loading properly

## 📱 Testing Your Live Site

1. Open your Netlify URL in a browser
2. Test all quiz functionality
3. Check responsive design on mobile
4. Verify all links and buttons work
5. Test the blood compatibility table

## 🎉 Success!

Your blood testing platform is now live and accessible to anyone on the internet! You can share the URL with friends, family, or anyone interested in learning about blood types.
