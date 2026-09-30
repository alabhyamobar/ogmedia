# MongoDB Atlas Production Deployment & Cost Guide (`mongo.md`)

This guide explains how to migrate and deploy the **OG Media CRM** database to a paid tier on **MongoDB Atlas** (MongoDB's official managed cloud database), step-by-step, along with realistic cost breakdowns and tier recommendations.

---

## 1. How Much Should You Pay? (Pricing & Tier Recommendation)

### The Architecture Advantage: Why Redis Saves You Money
In a naive CRM, 1,000,000 burst contact-form submissions hit MongoDB directly, forcing you to purchase an expensive **M40 or M50 cluster ($400 – $1,200/month)** just to prevent database crashes.

Because the **OG Media CRM uses Redis Streams as a write-buffer**, submissions are absorbed at memory speed and written into MongoDB at a steady, controlled rate (`LEAD_WORKER_CONCURRENCY=20`, `bulkWrite`).

**Result:** You only need an entry-level dedicated cluster or flex tier.

---

### MongoDB Atlas Tier Comparison (2026 Pricing)

| Tier | Type | RAM / vCPU | Max Connections | Continuous Backups | Estimated Monthly Cost | Recommendation for OG Media |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **M0 Sandbox** | Shared | 512 MB (Shared) | 500 max | ❌ No | **$0** (Free) | **Dev / Testing Only** (No SLA, sleeps under idle, no automated restores) |
| **Atlas Flex** | Serverless / Pay-as-you-go | Dynamic | Dynamic (up to 500) | Basic (7 days) | **~$10 – $35 / month** (based on IOPS) | **Good for low/sporadic starting traffic** |
| **M10 Dedicated** | **Dedicated Cluster** (3-node Replica Set) | **2 GB RAM / 2 vCPU** | **1,500 connections** | **✅ Continuous 24/7 (PITR)** | **~$57 – $65 / month** | ⭐ **RECOMMENDED TIER (Best Value for Production)** |
| **M20 Dedicated** | Dedicated Cluster | 4 GB RAM / 2 vCPU | 3,000 connections | ✅ Continuous 24/7 (PITR) | **~$140 – $160 / month** | Upgrade when leads exceed 500,000 active records |
| **M30 Dedicated** | High-Scale Dedicated | 8 GB RAM / 2 vCPU | 3,000 connections | ✅ Continuous 24/7 (PITR) | **~$280 – $320 / month** | Enterprise agency scale with 20+ full-time employees querying analytics |

---

### ⭐ Final Recommendation: **Cluster M10 (~$57/month)**

For a production CRM handling real clients, inquiries, and employee access, choose the **M10 Dedicated Cluster**:

1. **Why NOT Shared/Free (M0)?**
   * Shared tiers have strict RAM limits (512MB), no custom compound index sizing, no VPC peering, and no automated point-in-time disaster recovery.
2. **Why M10?**
   * Provides a **3-node Replica Set** (1 Primary + 2 Secondary nodes across different availability zones). If one server in AWS/GCP dies, Atlas automatically fails over in under 5 seconds with zero data loss.
   * Gives you **1,500 connections** (our backend uses a pool of 50 per instance, so you can easily scale up to 10 Express API instances).
   * Includes automated **Point-in-Time Restore (PITR)**: If someone accidentally drops a collection, you can roll back to any exact second in the past 7 days.

---

## 2. Step-by-Step Deployment Guide to MongoDB Atlas

### Step 1: Create an Account & Organization
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Sign up or log in.
3. Create a new Organization (e.g. `OG Media Agency`) and a new Project (e.g. `OG-Media-CRM`).

---

### Step 2: Deploy a Paid Dedicated Cluster (M10)
1. In your Atlas dashboard, click **"Create"** (or **"Build a Database"**).
2. Under deployment options, select **Dedicated** (or **Flex** if you want pay-as-you-go).
3. Configure the cluster:
   * **Cloud Provider & Region:**
     * Choose **AWS** (or Google Cloud).
     * Select the region closest to your target audience and backend server (e.g. **AWS Mumbai `ap-south-1`** for India, or **AWS N. Virginia `us-east-1`** for US/global).
   * **Cluster Tier:** Select **M10** (General).
   * **Additional Settings:**
     * Storage: 10 GB (auto-expandable).
     * Backup: Ensure **Continuous Cloud Backups** is checked.
   * **Cluster Name:** Name it `ogmedia-production`.
4. Click **Create Cluster** (takes ~3 to 5 minutes to provision the 3 replica set nodes).

---

### Step 3: Configure Database Security & User Access

Never use your personal Atlas account email/password in the application code. Create a dedicated application user:

1. In the left navigation menu, click **Database Access** under *Security*.
2. Click **Add New Database User**.
3. Set:
   * **Authentication Method:** Password
   * **Username:** `ogmedia_app_user`
   * **Password:** Click **Autogenerate Secure Password** and copy it safely.
   * **Database User Privileges:** Select **Read and write to any database** (or restrict specifically to `ogmedia_crm`).
4. Click **Add User**.

---

### Step 4: Configure Network IP Access (Security Whitelist)

Atlas blocks all incoming connections by default until explicitly whitelisted:

1. In the left menu, click **Network Access** under *Security*.
2. Click **Add IP Address**.
3. Depending on your backend hosting:
   * **If testing from your local machine:** Click **Add Current IP Address**.
   * **If deployed on AWS / Railway / Render / DigitalOcean / Heroku:** Add your production server's Static Elastic IP address (or allow `0.0.0.0/0` temporarily with strong passwords if using dynamic IP serverless hosts).
4. Click **Confirm**.

---

### Step 5: Copy the Connection String (SRV URI)

1. Return to the **Database Deployments** page.
2. Next to your cluster (`ogmedia-production`), click **Connect**.
3. Choose **Drivers** (Node.js).
4. Select Driver: **Node.js**, Version: **6.0 or later**.
5. Copy the connection string. It will look like this:
   ```text
   mongodb+srv://ogmedia_app_user:<db_password>@ogmedia-production.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=ogmedia-production
   ```

---

### Step 6: Connect the OG Media Backend to MongoDB Atlas

1. Open your backend environment file: [`backend/.env`](file:///c:/Users/Rishi/OneDrive/Desktop/ogmedia/backend/.env).
2. Update `MONGODB_URI` with your Atlas connection string, adding `/ogmedia_crm` before the `?` query parameters:

```env
# ==============================================================================
# PRODUCTION MONGODB ATLAS CONFIGURATION
# ==============================================================================
MONGODB_URI=mongodb+srv://ogmedia_app_user:YOUR_ACTUAL_PASSWORD@ogmedia-production.xxxx.mongodb.net/ogmedia_crm?retryWrites=true&w=majority&appName=ogmedia-production

# Connection Pool Tuning for M10 Cluster (Supports up to 1,500 total)
MONGODB_MAX_POOL_SIZE=50
MONGODB_MIN_POOL_SIZE=10
```

3. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```
4. Verify the startup logs:
   ```text
   INFO: MongoDB connected successfully
       host: "ogmedia-production-shard-00-00.xxxx.mongodb.net"
       poolSize: 50
   ```

---

### Step 7: Initialize Your Root Super Admin in Atlas

Once connected to the paid Atlas cluster for the first time, provision your root Super Administrator:

```bash
cd backend
npm run create-super-admin
```
Follow the interactive prompt to set your master agency credentials.

---

## 3. Important Atlas Production Checklist

### 1. Automated Indexes
The backend automatically creates optimal compound indexes upon startup:
* `{ eventId: 1 }` (Unique constraint for worker idempotency)
* `{ service: 1, createdAt: -1 }` (For fast expertise filtering)
* `{ status: 1, createdAt: -1 }` (For stage analytics)
* `{ assignedTo: 1, createdAt: -1 }` (For employee caseloads)

You can inspect these anytime in Atlas under **Browse Collections ➔ Indexes**.

### 2. Setup Billing Alerts
To prevent surprise cloud bills:
1. In Atlas, click your profile icon (top right) ➔ **Billing**.
2. Click **Billing Alerts**.
3. Set an alert: *"Send email notification if monthly bill exceeds $70 USD"*.

### 3. Monitoring Health & Latency
* In your Atlas cluster overview, click the **Metrics** tab.
* Monitor **Connections** (should hover around 10–50) and **Disk IOPS**.
* Because Redis buffers contact bursts, your MongoDB IOPS graph will remain calm and smooth even during heavy website traffic.

---

## 4. Cost Summary Cheat Sheet

| Service | Recommended Provider | Tier | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **MongoDB** | MongoDB Atlas | **M10 Dedicated** | **~$57 / month** |
| **Redis Buffer** | Upstash / Redis Cloud / AWS ElastiCache | Pay-as-you-go / Standard | **~$0 – $15 / month** |
| **Backend API** | Render / Railway / AWS App Runner / VPS | 1 vCPU, 1–2 GB RAM | **~$10 – $25 / month** |
| **Frontend** | Vercel / Netlify / Cloudflare Pages | Pro / Standard | **$0 – $20 / month** |
| **TOTAL** | — | **Full High-Availability Stack** | **~$70 – $95 / month** |
