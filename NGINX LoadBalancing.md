If you're running **PM2** with two instances of your Node.js application on a VPS with **2 CPU cores**, and you want to use **NGINX** to balance traffic between those instances, you're talking about setting up **NGINX as a reverse proxy and load balancer**.

### Why Use NGINX with PM2?

PM2 handles the process management by spawning multiple instances of your Node.js application on multiple cores, but it does not balance incoming HTTP traffic. That’s where **NGINX** comes in:
- **NGINX** will sit in front of your application and distribute incoming client requests across the multiple instances that PM2 has created.
- It acts as a **reverse proxy** and ensures efficient distribution of traffic, load balancing between the instances to optimize resource usage and improve performance.

### How to Set Up NGINX to Split Traffic

1. **Run Two PM2 Instances** on Different Ports
   When PM2 starts multiple instances of your Node.js application, each instance will run on a different port. For example, you might have two instances running on ports `3001` and `3002`.

   You can check the ports PM2 is using with:

   ```bash
   pm2 list
   ```

   Example setup:
   - Instance 1 on **Port 3001**
   - Instance 2 on **Port 3002**

2. **Install NGINX on Your VPS**
   First, make sure **NGINX** is installed on your VPS. You can install it on Ubuntu, for example, by running:

   ```bash
   sudo apt update
   sudo apt install nginx
   ```

3. **Configure NGINX as a Reverse Proxy and Load Balancer**

   You'll now configure NGINX to balance incoming HTTP traffic between the two PM2 instances (on ports 3001 and 3002). This will ensure that when clients access your app via the domain/IP, NGINX will distribute their requests evenly across the available Node.js instances.

   - Open the NGINX configuration file:

     ```bash
     sudo nano /etc/nginx/sites-available/default
     ```

   - Add the following configuration to the server block:

     ```nginx
     http {
         upstream nodejs_backend {
             # List your PM2 instances
             server 127.0.0.1:3001;
             server 127.0.0.1:3002;
         }

         server {
             listen 80;  # Listen on port 80 for HTTP traffic

             # Proxy settings for your Node.js app
             location / {
                 proxy_pass http://nodejs_backend;  # Pass traffic to the upstream block
                 proxy_set_header Host $host;
                 proxy_set_header X-Real-IP $remote_addr;
                 proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                 proxy_set_header X-Forwarded-Proto $scheme;
             }
         }
     }
     ```

     Explanation:
     - The `upstream` block defines a load-balanced group of servers (your two PM2 instances). In this case, requests will be forwarded to `127.0.0.1:3001` and `127.0.0.1:3002`.
     - Inside the `server` block, NGINX listens on port `80` (for HTTP requests). When a request comes in, it proxies the request to the `nodejs_backend` group, which includes your PM2 instances.

4. **Configure Load Balancing Strategy**

   By default, NGINX uses a **round-robin** load balancing strategy, which means it will alternate requests between the available instances.

   You can customize the load-balancing behavior:
   - **Round Robin (default):** Each request is forwarded to the next available server in the list.
   - **Least Connections:** Forward requests to the server with the fewest active connections.

     To use least connections, modify the upstream block:

     ```nginx
     upstream nodejs_backend {
         least_conn;
         server 127.0.0.1:3001;
         server 127.0.0.1:3002;
     }
     ```

   - **IP Hash:** Ensures that the same client (IP address) is always connected to the same server.

     Example for IP hash strategy:

     ```nginx
     upstream nodejs_backend {
         ip_hash;
         server 127.0.0.1:3001;
         server 127.0.0.1:3002;
     }
     ```

5. **Restart NGINX to Apply the Changes**

   Once you've configured NGINX, restart it to apply your changes:

   ```bash
   sudo systemctl restart nginx
   ```

### How NGINX Splits the Traffic

With this setup:
- **NGINX** will act as a **reverse proxy** in front of your Node.js app. 
- Incoming traffic to your VPS (on port 80) will hit NGINX, which will then distribute the requests across the two PM2 instances.
- Based on the load-balancing strategy you configured (default round robin, least connections, or IP hash), NGINX will forward traffic to either `127.0.0.1:3001` or `127.0.0.1:3002`.

### Example Workflow

1. A user sends an HTTP request to your domain (e.g., `http://yourdomain.com`).
2. NGINX receives the request on port `80`.
3. NGINX forwards the request to one of the PM2 instances (e.g., `127.0.0.1:3001`).
4. The instance processes the request and responds back to NGINX.
5. NGINX sends the response back to the client.

Each time a new request comes in, NGINX will choose which instance to forward the request to, balancing the load between your Node.js processes.

---

### In Summary:
- **PM2** runs multiple instances of your Node.js app, one per core (in your case, 2 instances on a VPS with 2 cores).
- **NGINX** acts as a **reverse proxy** that sits in front of these PM2 instances and distributes incoming traffic.
- You configure **NGINX** to load-balance traffic between the instances by defining an `upstream` block in its configuration.
- NGINX can use different load balancing strategies like **round robin**, **least connections**, or **IP hash** to distribute traffic.

Let me know if you’d like more details on any part of this setup!
