// // src/app/api/upload/image/route.ts

// import { NextResponse } from 'next/server'
// import { v2 as cloudinary } from 'cloudinary'
// import formidable, { Fields, Files, Error as FormidableError, File } from 'formidable'

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
//   api_key: process.env.CLOUDINARY_API_KEY as string,
//   api_secret: process.env.CLOUDINARY_API_SECRET as string
// })

// // Disable Next.js's default body parsing to handle file uploads manually
// export const config = {
//   api: {
//     bodyParser: false
//   }
// }

// // Define the POST handler
// export async function POST(req: Request) {
//   const form = formidable({
//     // Optional: Customize formidable options if needed
//     multiples: false, // Disable multiple file uploads
//     keepExtensions: true, // Keep file extensions
//     maxFileSize: 5 * 1024 * 1024 // 5 MB
//   })

//   return new Promise<NextResponse>((resolve, reject) => {
//     form.parse(req, async (err: FormidableError, fields: Fields, files: Files) => {
//       if (err) {
//         console.error('Error parsing form:', err)
//         return resolve(NextResponse.json({ error: 'Failed to upload image' }, { status: 500 }))
//       }

//       // Access the uploaded file
//       const file = files.image as File

//       if (!file) {
//         return resolve(NextResponse.json({ error: 'No image file provided' }, { status: 400 }))
//       }

//       try {
//         // Upload the image to Cloudinary
//         const result = await cloudinary.uploader.upload(file.filepath, {
//           folder: 'companies',
//           resource_type: 'image' // Ensure the resource type is image
//         })

//         return resolve(NextResponse.json({ url: result.secure_url }, { status: 200 }))
//       } catch (uploadErr) {
//         console.error('Error uploading to Cloudinary:', uploadErr)
//         return resolve(NextResponse.json({ error: 'Failed to upload image' }, { status: 500 }))
//       }
//     })
//   })
// }
