import qrcode
import io
import base64

def generate_qr_datauri(url, box_size=6, border=2):
    qr = qrcode.QRCode(
        box_size=box_size,
        border=border,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    b = base64.b64encode(buffered.getvalue()).decode()

    return f"data:image/png;base64,{b}"