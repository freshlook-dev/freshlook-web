export default function Footer() {
  return (
    <footer className="bg-neutral-100 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">

        <div>
          <h2 className="font-playfair text-xl mb-4">Fresh Look</h2>
          <p className="text-sm text-gray-600">
            Premium aesthetic treatments tailored for your beauty.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Links</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li><a href="/services">Services</a></li>
            <li><a href="/book">Book Appointment</a></li>
            <li><a href="/shop">Shop</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-sm text-gray-600">Prishtinë & Fushë Kosovë</p>
          <p className="text-sm text-gray-600">Instagram / WhatsApp</p>
        </div>

      </div>

      <div className="text-center text-sm text-gray-500 pb-6">
        © Fresh Look Aesthetics
      </div>
    </footer>
  )
}