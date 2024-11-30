// src/app/api/job/upload-image/route.ts

// Specify the runtime as Node.js
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Busboy, { FileStream } from 'busboy'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { Readable } from 'stream'
import fetch from 'node-fetch' // Ensure node-fetch is installed if not using global fetch

// Import Node.js IncomingHttpHeaders type
import { IncomingHttpHeaders } from 'http'

// Define the response structure
type Data = {
  success: boolean
  message: string
  imageUrl?: string
}

// Helper function to convert Headers to IncomingHttpHeaders
function headersToIncomingHttpHeaders(headers: Headers): IncomingHttpHeaders {
  const incomingHeaders: IncomingHttpHeaders = {}
  headers.forEach((value, key) => {
    incomingHeaders[key.toLowerCase()] = value
  })
  return incomingHeaders
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate Content-Type
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { success: false, message: 'Invalid content type. Expected multipart/form-data.' },
        { status: 400 }
      )
    }

    // Convert Headers to IncomingHttpHeaders
    const incomingHeaders = headersToIncomingHttpHeaders(req.headers)

    // Initialize Busboy with correct headers
    const busboy = new Busboy({ headers: incomingHeaders })

    // Retrieve environment variables
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME
    const accessKey = process.env.BUNNY_STORAGE_ACCESS_KEY
    const cdnUrl = process.env.BUNNY_CDN_URL // e.g., https://yourstoragezone.b-cdn.net

    if (!storageZoneName || !accessKey || !cdnUrl) {
      return NextResponse.json({ success: false, message: 'Storage configuration not set.' }, { status: 500 })
    }

    let uploadError: string | null = null
    let imageUrl: string | undefined = undefined

    // To store file data
    let fileBuffer: Buffer[] = []
    let fileSize = 0
    const maxSize = 5 * 1024 * 1024 // 5MB

    // Listen for 'file' events
    busboy.on('file', (fieldname: string, file: FileStream, filename: string, encoding: string, mimetype: string) => {
      if (fieldname !== 'image') {
        // Skip non-image fields
        file.resume()
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(mimetype)) {
        uploadError = 'Invalid file type. Only JPEG, PNG, and GIF are allowed.'
        file.resume()
        return
      }

      // Handle file data
      file.on('data', (data: Buffer) => {
        fileSize += data.length
        if (fileSize > maxSize) {
          uploadError = 'File size exceeds 5MB limit.'
          file.destroy()
          return
        }
        fileBuffer.push(data)
      })

      file.on('end', async () => {
        if (uploadError) {
          return
        }

        // Generate unique filename
        const uniqueFilename = `${uuidv4()}-${path.basename(filename)}`

        // Construct upload URL for Bunny.net
        const uploadUrl = `https://storage.bunnycdn.com/${storageZoneName}/jobs/${uniqueFilename}`

        try {
          const buffer = Buffer.concat(fileBuffer)
          const response = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
              AccessKey: accessKey,
              'Content-Type': mimetype
            },
            body: buffer
          })

          if (response.ok) {
            // Construct the public URL
            imageUrl = `${cdnUrl}/jobs/${uniqueFilename}`
          } else {
            console.error('Failed to upload to Bunny.net:', response.statusText)
            uploadError = 'Failed to upload image to Bunny.net.'
          }
        } catch (err) {
          console.error('Error uploading to Bunny.net:', err)
          uploadError = 'Error uploading image to Bunny.net.'
        }
      })
    })

    // Handle errors
    busboy.on('error', err => {
      console.error('Busboy error:', err)
      uploadError = 'Error parsing the files.'
    })

    // Parse the request
    const promise = new Promise<Data>((resolve, reject) => {
      busboy.on('finish', () => {
        if (uploadError) {
          resolve({ success: false, message: uploadError })
        } else if (imageUrl) {
          resolve({ success: true, message: 'Image uploaded successfully.', imageUrl })
        } else {
          resolve({ success: false, message: 'No file uploaded.' })
        }
      })

      busboy.on('error', err => {
        reject({ success: false, message: 'Error parsing the files.' })
      })
    })

    // Pipe the request body to Busboy
    const readableStream = Readable.fromWeb(req.body as ReadableStream<Uint8Array>)
    readableStream.pipe(busboy)

    // Await the parsing and upload
    const result = await promise

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 })
  }
}
