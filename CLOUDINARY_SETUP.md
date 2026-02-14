# Cloudinary Setup

To enable background image uploads in production (Render), you must set up Cloudinary.

## 1. Get Credentials

1. Sign up/Log in to [Cloudinary](https://cloudinary.com/)
2. Go to **Dashboard**
3. Copy **Cloud Name**, **API Key**, and **API Secret**

## 2. Set Environment Variables in Render

Go to Render Dashboard -> Your Service -> Environment -> Add Environment Variables:

| Key                     | Value             |
| ----------------------- | ----------------- |
| `CLOUDINARY_CLOUD_NAME` | (your cloud name) |
| `CLOUDINARY_API_KEY`    | (your api key)    |
| `CLOUDINARY_API_SECRET` | (your api secret) |

## 3. Local Development

Add the same variables to your `server/.env` file to test locally.
