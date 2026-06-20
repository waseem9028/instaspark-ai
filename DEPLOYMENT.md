# Hosting InstaSpark AI on GitHub Pages for Android Mobile

Follow these steps to upload your app to GitHub and launch it on your Android phone for free.

---

## Step 1: Create a Repository on GitHub
1. Open [GitHub](https://github.com/) in your browser and log in to your account.
2. Click the **"New"** button (or **"+"** icon in the top right and select **"New repository"**).
3. Set the following options:
   - **Repository name**: `instagram-caption-generator` (or any name you like)
   - **Visibility**: Select **Public** (this is required to use the free tier of GitHub Pages).
   - **Initialize this repository with**: Leave all options unchecked (Do NOT add a README, `.gitignore`, or license, keep it completely empty).
4. Click the green **"Create repository"** button.
5. Copy the HTTPS repository URL provided (it will look like: `https://github.com/YOUR-USERNAME/instagram-caption-generator.git`).

---

## Step 2: Push the Files to GitHub
Open your local terminal in the project directory (`C:\Users\khali\.gemini\antigravity\scratch\instagram-caption-generator`) and run the following three commands:

```bash
# 1. Rename the default branch to 'main'
git branch -M main

# 2. Link your local repository to your new GitHub repository
# (REPLACE the URL below with the one you copied in Step 1)
git remote add origin https://github.com/YOUR-USERNAME/instagram-caption-generator.git

# 3. Push your code to GitHub
git push -u origin main
```

---

## Step 3: Enable GitHub Pages
Once the files are pushed successfully to GitHub, enable hosting in the settings:
1. Go to your repository page on GitHub.
2. Click on the **"Settings"** tab (the gear icon at the top menu bar).
3. On the left sidebar menu, scroll down to the **"Code and automation"** section and click **"Pages"**.
4. Under **"Build and deployment"**:
   - For **Source**, select **"Deploy from a branch"** (default).
   - For **Branch**, click the dropdown and select **`main`**.
   - Leave the folder as **`/ (root)`**.
   - Click the **"Save"** button.
5. Wait 1 to 2 minutes for GitHub to build and host your files. 
6. Refresh the page. You will see a banner at the top of the Pages section saying:
   > 🚀 **Your site is live at** `https://YOUR-USERNAME.github.io/instagram-caption-generator/`

---

## Step 4: Run the App on Android Mobile
1. Open the **Google Chrome** app on your Android phone.
2. Type in or visit your live URL: `https://YOUR-USERNAME.github.io/instagram-caption-generator/`
3. Click the gear icon (⚙️) on the top-right of the webpage.
4. Paste your **Google Gemini API Key** and hit **"Save Settings"**.
5. Upload your image/video, type what your post is about, and click **"Generate Instagram Kit"**!

*(Note: Because the API Key is saved in your mobile browser's private local storage, it never travels to GitHub or any server, making this method completely secure.)*
