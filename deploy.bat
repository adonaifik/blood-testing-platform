@echo off
echo 🚀 Deploying Blood Testing Platform to GitHub...
echo.

echo 📁 Adding all files to Git...
git add .

echo.
echo 💾 Creating commit...
git commit -m "Updated blood testing platform - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

echo.
echo 🚀 Pushing to GitHub...
git push origin main

echo.
echo ✅ Deployment complete!
echo 🌐 Your changes will be live on Netlify in a few minutes.
echo.
pause
