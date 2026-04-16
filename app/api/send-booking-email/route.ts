import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      email,
      name,
      service,
      date,
      time,
      location,
    } = body

    // ✅ VALIDATION
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // ✅ DEBUG LOG
    console.log('Sending email to:', email)

    // ✅ FIX: HANDLE PORT PROPERLY
    const port = Number(process.env.EMAIL_PORT)

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port,
      secure: port === 465, // ✅ FIXED
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // ✅ VERIFY CONNECTION (IMPORTANT FOR DEBUG)
    await transporter.verify()
    console.log('SMTP connection verified')

    // ✅ SEND EMAIL
    const info = await transporter.sendMail({
      from: `"Fresh Look Aesthetics" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Appointment Confirmation',
      html: `
        <div style="margin:0; padding:0; background:#f5f5f5; font-family:Arial, sans-serif;">
          
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr>
              <td align="center">

                <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:#C6A96B; padding:25px; text-align:center;">
                      <img 
                        src="https://le-cdn.website-editor.net/841c8ad3c9c9410c996611a491c5cdd2/dms3rep/multi/opt/LOGO-HORIZONTAL-1-removebg-preview-1920w.png" 
                        alt="Fresh Look"
                        style="height:50px; margin-bottom:10px;"
                      />
                      <h1 style="margin:0; font-size:18px; color:white; letter-spacing:1px;">
                        FRESH LOOK AESTHETICS
                      </h1>
                    </td>
                  </tr>

                  <!-- BODY -->
                  <tr>
                    <td style="padding:30px; color:#333;">

                      <h2 style="margin-top:0; color:#C6A96B;">
                        Appointment Confirmed ✨
                      </h2>

                      <p>Hello <b>${name || 'Client'}</b>,</p>

                      <p style="margin-bottom:20px;">
                        Your appointment has been successfully booked.
                      </p>

                      <div style="background:#fafafa; padding:20px; border-radius:12px; margin-bottom:20px;">
                        <p><b>Service:</b> ${service || '-'}</p>
                        <p><b>Date:</b> ${date || '-'}</p>
                        <p><b>Time:</b> ${time || '-'}</p>
                        <p><b>Location:</b> ${location || '-'}</p>
                      </div>

                      <p>We look forward to welcoming you ✨</p>

                      <p style="margin-top:30px; font-size:14px; color:#777;">
                        Fresh Look Aesthetics<br/>
                        Prishtinë & Fushë Kosovë
                      </p>

                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:20px; text-align:center; font-size:12px; color:#999;">
                      © Fresh Look Aesthetics
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </div>
      `,
    })

    console.log('Email sent:', info.messageId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('EMAIL ERROR:', error)

    return NextResponse.json(
      { error: error.message || 'Email failed' },
      { status: 500 }
    )
  }
}