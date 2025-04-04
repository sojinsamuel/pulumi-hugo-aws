# Hugo and Pulumi Static Website Deployment on AWS S3

This project demonstrates how to deploy a static website using [Hugo](https://gohugo.io/) and [Pulumi](https://www.pulumi.com/) on AWS S3. Hugo is a fast static site generator, and Pulumi is an infrastructure-as-code tool that allows you to define cloud resources using TypeScript. The site is deployed to an S3 bucket configured as a static website, with public access enabled for viewing.

## Table of Contents
- [Live Demo](#live-demo)
- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
  - [Step 1: Install Pulumi CLI](#step-1-install-pulumi-cli)
  - [Step 2: Set Up Your Project Directory](#step-2-set-up-your-project-directory)
  - [Step 3: Create a Hugo Site](#step-3-create-a-hugo-site)
  - [Step 4: Create a Pulumi Project](#step-4-create-a-pulumi-project)
  - [Step 5: Configure AWS Credentials](#step-5-configure-aws-credentials)
  - [Step 6: Install Dependencies](#step-6-install-dependencies)
  - [Step 7: Write Pulumi Code](#step-7-write-pulumi-code)
  - [Step 8: Build the Hugo Site](#step-8-build-the-hugo-site)
  - [Step 9: Deploy with Pulumi](#step-9-deploy-with-pulumi)
  - [Step 10: Verify the Deployment](#step-10-verify-the-deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)
- [Contributing](#contributing)

## Live Demo
You can view the deployed site here: [http://site-bucket-657f8f1.s3-website-ap-southeast-2.amazonaws.com](http://site-bucket-9170bd3.s3-website-ap-southeast-2.amazonaws.com/)

## Project Overview
This project sets up a static website using Hugo with the Ananke theme, deploys it to an AWS S3 bucket using Pulumi, and makes it publicly accessible. The process involves:
- Creating a Hugo site with a sample post.
- Customizing the homepage to display recent posts.
- Using Pulumi to define an S3 bucket, configure it as a website, and upload the Hugo site files.
- Ensuring the site is publicly accessible by configuring S3 public access settings and a bucket policy.

The result is a fast, static website hosted on S3, accessible via a public URL.

## Prerequisites
Before starting, ensure you have the following:
- **AWS Account**: Sign up at [AWS](https://signin.aws.amazon.com/signup?request_type=register). Your IAM user needs permissions for S3 operations:
  ```json
  {
      "Effect": "Allow",
      "Action": [
          "s3:PutObject",
          "s3:GetObject",
          "s3:PutBucketPolicy",
          "s3:PutPublicAccessBlock",
          "s3:GetBucketPublicAccessBlock"
      ],
      "Resource": "arn:aws:s3:::site-bucket-*"
  }
```
- Pulumi CLI: Install it following the official guide.

- Node.js: Version 16 or higher (I used v20.12.2). Download from Node.js.

- Hugo: I used v0.128.0. Install it from Hugo's installation

### Step 1: Install Pulumi CLI
Install the Pulumi CLI by running:
```shell
curl -fsSL https://get.pulumi.com | sh
```
This command downloads and installs the Pulumi CLI, which you’ll use to manage your cloud infrastructure.

Verify the installation:

```shell
pulumi version
```

![Pulumi CLI installation](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/j3z6hg61vd07qsiyhzhx.gif)

### Step 2: Set Up Your Project Directory
Create a new directory for your project and navigate into it:
```shell
mkdir pulumi-hugo-aws && cd pulumi-hugo-aws
```
This directory will hold all the files for your Hugo site and Pulumi project.

### Step 3: Create a Hugo Site

Initialize a new Hugo site:

```shell
hugo new site mysite && cd mysite
```
This creates a new Hugo site in the `mysite` directory with the basic structure for your static site.


![hugo initialization](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lkqyyjp0detb4w8gddoy.gif)

**Add a Theme:**
Hugo sites need a theme to render content. We'll use the Ananke theme for this tutorial:

```shell
git init
git submodule add https://github.com/budparr/gohugo-theme-ananke.git themes/ananke
echo 'theme = "ananke"' >> hugo.toml
```

**Create a Sample Post:**

Add a sample post to ensure there’s content to display:

```shell
hugo new content/posts/my-first-post.md
```

Edit the post to add some content and ensure it's published:

```shell
nano content/posts/my-first-post.md
```

Update the file to look like this:

```yaml
+++
title = 'My First Post'
date = 2025-04-04T23:41:34+05:30
draft = false
+++

This is my first post on Hugo
```

![Hugo content post generation](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/t341587eknhp8qgyopcy.gif)

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in `nano`).

**Customize the Homepage:**

By default, the Ananke theme's homepage doesn't list posts. Let's customize it to show recent posts:

![hugo layout add](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/dnj2ek9uora88p858wh6.gif)

```shell
mkdir -p layouts
nano layouts/index.html
```

**Add the following content:**

```html
{{ define "main" }}
  <div class="container">
    <h1>{{ .Site.Title }}</h1>
    <p>Welcome to my Hugo site!</p>
    <h2>Recent Posts</h2>
    <ul>
      {{ range first 5 (where .Site.RegularPages "Section" "posts") }}
        <li>
          <a href="{{ .RelPermalink }}">{{ .Title }}</a>
          <small>{{ .Date.Format "January 2, 2006" }}</small>
        </li>
      {{ end }}
    </ul>
  </div>
{{ end }}
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in `nano`).

This template displays the site title and a list of up to 5 recent posts from the `posts` section.

### Step 4: Create a Pulumi Project
Initialize a new Pulumi project in the `mysite` directory:

![pulumi initialization](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7jo4fwfqwgguuwkmyeue.gif)


```shell
pulumi new aws-typescript --force
```
- `--force` is needed because the directory isn’t empty (Hugo already created files).

Follow the prompts to set up your Pulumi project. This command initializes a new Pulumi project using the AWS TypeScript template, which provides a starting point for deploying AWS resources using TypeScript.

Sure, here's a corrected version using active voice and EQ:

_**P.S:** If you want to learn why `pulumi new` expects us to always start from an empty directory, [check out this GitHub discussion](https://github.com/pulumi/pulumi/issues/2671)._

### Step 5: Configure AWS Credentials
Make sure your [AWS credentials are configured](https://www.pulumi.com/registry/packages/aws/installation-configuration/). You can do this by running:

```
aws configure
```
This command sets up your AWS credentials, which are necessary for Pulumi to interact with AWS services. You will be prompted to enter your AWS `Access Key ID`, `Secret Access Key`, and default `region`. Your IAM user must have permissions for S3 operations (see Prerequisites).

### Step 6: Install Dependencies

Install the necessary Pulumi packages and mime-types for handling file types:

```shell
npm install @pulumi/aws @pulumi/pulumi mime-types @types/mime-types --save-dev
```
- `@pulumi/aws` and `@pulumi/pulumi` are required for AWS resource management.

- `mime-types` helps set correct MIME types for uploaded files.

### Step 7: Write Pulumi Code


![add pulumi IaC code](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/l28s7c7dc5cs51okih5i.gif)


Replace the default `index.ts` with the following code to set up an S3 bucket, configure it as a website, and upload the Hugo site:

```javascript
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";
import * as path from "path";
import * as mime from "mime-types";

// Create an S3 bucket
const siteBucket = new aws.s3.Bucket("site-bucket", {});

// Configure the bucket as a website
const website = new aws.s3.BucketWebsiteConfigurationV2("website", {
    bucket: siteBucket.id,
    indexDocument: {
        suffix: "index.html",
    },
});

// Configure public access block to allow public access
const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
    bucket: siteBucket.id,
    blockPublicAcls: false,
    blockPublicPolicy: false,
    ignorePublicAcls: false,
    restrictPublicBuckets: false,
});

// Add a bucket policy to allow public read access
const bucketPolicy = new aws.s3.BucketPolicy("bucketPolicy", {
    bucket: siteBucket.bucket,
    policy: siteBucket.bucket.apply(bucketName => JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucketName}/*`],
        }],
    })),
}, { dependsOn: [publicAccessBlock] });

// Function to recursively upload files from a directory
function uploadDirectory(dirPath: string, bucket: aws.s3.Bucket) {
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach((dirent) => {
        const filePath = path.join(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            uploadDirectory(filePath, bucket);
        } else {
            const relativePath = path.relative("./public", filePath);
            new aws.s3.BucketObject(relativePath, {
                bucket: siteBucket,
                source: new pulumi.asset.FileAsset(filePath),
                contentType: mime.lookup(filePath) || "application/octet-stream",
                key: relativePath,
            }, { dependsOn: [publicAccessBlock, website, bucketPolicy] });
        }
    });
}

// Upload all files from the Hugo 'public' directory
uploadDirectory("./public", siteBucket);

// Export the website URL
export const bucketEndpoint = pulumi.interpolate`http://${website.websiteEndpoint}`;
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X` in `nano`).

**This code:**

- Creates an S3 bucket and configures it as a website with `index.html` as the default page.

- Disables S3 Block Public Access settings to allow public access.

- Applies a bucket policy to make all objects publicly readable.

- Recursively uploads all files from the `public/` directory, preserving the directory structure and setting correct MIME types.


### Step 8: Build Hugo Site

Generate the static files for your Hugo site:
```shell
hugo
```

This creates the `public/` directory with your site’s static files, including `index.html` and the post at `posts/my-first-post/`.

### Step 9: Deploy with Pulumi

Deploy the site to AWS:
![pulumi deploy to aws](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ws4ay1dfs874pid3vxx3.gif)


```shell
pulumi up
```

- Pulumi will preview the changes, showing the resources to be created (S3 bucket, website configuration, bucket policy, and objects).

- Select `yes` to deploy.

- Once complete, the output will include `bucketEndpoint` (e.g., `http://site-bucket-9170bd3.s3-website-ap-southeast-2.amazonaws.com`).

### Step 10: Verify the Deployment

![hugo deployed website using pulumi IaC](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zjc2bqd0x2b551rs9m0x.gif)

Open the `bucketEndpoint` URL in a browser. You should see your Hugo site with the Ananke theme, displaying the site title ("My New Hugo Site") and a "Recent Posts" section listing "My First Post" with a link to the full post.

## Project Structure (Key Files Only)

```
pulumi-hugo-aws/
└── mysite/
    ├── archetypes/         # Hugo archetypes for new content
    ├── content/            # Hugo content files (e.g., posts/)
    │   └── posts/
    │       └── my-first-post.md
    ├── layouts/            # Custom Hugo templates
    │   └── index.html
    ├── public/             # Generated static files
    ├── themes/             # Hugo themes (e.g., ananke/)
    ├── hugo.toml           # Hugo configuration
    ├── index.ts            # Pulumi deployment script
    ├── package.json        # Node.js dependencies
    ├── Pulumi.yaml         # Pulumi project configuration
    └── tsconfig.json       # TypeScript configuration
```

## Using Pulumi

During this project, I encountered several challenges:

- **Nested Directories**: The original `index.ts` didn't handle Hugo's nested `public/` directory structure, causing errors. I fixed this by adding a recursive `uploadDirectory` function.

- **Public Access**: S3's default Block Public Access settings blocked the bucket policy. Using `BucketPublicAccessBlock` resolved this.

- **Homepage Content**: Hugo's default homepage didn’t show posts, so I customized `layouts/index.html` to list recent posts.

Pulumi's TypeScript support made infrastructure management intuitive, and its integration with AWS simplified the deployment process. Hugo's static site generation ensured the site is fast and efficient.

## Troubleshooting
**Posts Not Showing on Homepage:**
- Ensure draft: false in content/posts/my-first-post.md.

- Verify layouts/index.html exists and includes the post listing code.

- Rebuild with hugo and redeploy with pulumi up.

**403 Forbidden Error:**
- Check your IAM permissions for S3 operations (see Prerequisites (#prerequisites)).

- Manually disable S3 Block Public Access in the AWS Console for the bucket (site-bucket-657f8f1) and rerun pulumi up.

**TypeScript Errors:**
- Ensure all dependencies are installed (npm install).

- Verify dependsOn is in the resource options object, not the args.

**Empty Site:**
- Confirm public/ contains index.html and other files after running hugo.

- Add more content if needed (e.g., hugo new content posts/another-post.md).

## Next Steps
- Add More Content: Create additional posts or pages in Hugo.

- Enable HTTPS: Use AWS CloudFront with an SSL certificate to serve the site over HTTPS (S3 websites are HTTP-only).

- Automate Deployments: Set up a CI/CD pipeline with GitHub Actions to automate hugo and pulumi up.

## Contributing
Contributions are welcome! Please:

1. Fork the repository.

2. Create a new branch (`git checkout -b feature/your-feature`).

3. Commit your changes (`git commit -m "Add your feature"`).

4. Push to the branch (`git push origin feature/your-feature`).

5. Open a pull request.
