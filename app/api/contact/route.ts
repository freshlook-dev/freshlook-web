import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, phone, message } = body

    // VALIDATION
    if (!name || !phone || !message) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      )
    }

    // MAIL TRANSPORTER (same as your booking system)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // EMAIL CONTENT
    await transporter.sendMail({
      from: `"Fresh Look Website" <${process.env.SMTP_USER}>`,
      to: 'info@freshlook-ks.com',
      subject: 'New Contact Message',
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}