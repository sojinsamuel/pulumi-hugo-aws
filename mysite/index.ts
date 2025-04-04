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
