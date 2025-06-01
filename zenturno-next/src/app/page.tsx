import Image from "next/image";
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">ZenTurno</span>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login"
                className="px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Simplify Your Appointment Booking
              </h1>
              <p className="text-xl mb-8">
                ZenTurno makes it easy to book and manage appointments with professionals.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="/signup"
                  className="px-6 py-3 rounded-md bg-white text-primary-600 font-semibold hover:bg-gray-100"
                >
                  Get Started
                </Link>
                <Link 
                  href="#features"
                  className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-primary-600"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-4xl">📅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ZenTurno</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform offers everything you need to streamline your appointment booking process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="Easy Booking"
              description="Book appointments with just a few clicks. Choose your preferred professional, service, and time slot."
              icon="🗓️"
            />
            <FeatureCard 
              title="Instant Confirmation"
              description="Receive immediate confirmation for your appointments. No more waiting for callbacks."
              icon="✅"
            />
            <FeatureCard 
              title="Reminders"
              description="Get timely reminders for your upcoming appointments so you never miss one."
              icon="⏰"
            />
            <FeatureCard 
              title="Manage Schedule"
              description="Professionals can easily manage their availability and view their appointment schedule."
              icon="📊"
            />
            <FeatureCard 
              title="Service Customization"
              description="Offer various services with custom pricing and duration to meet your business needs."
              icon="⚙️"
            />
            <FeatureCard 
              title="Client Management"
              description="Keep track of your clients' information and appointment history in one place."
              icon="👥"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join ZenTurno today and transform how you manage appointments.
          </p>
          <div className="flex justify-center space-x-4">
            <Link 
              href="/signup"
              className="px-6 py-3 rounded-md bg-white text-primary-600 font-semibold hover:bg-gray-100"
            >
              Sign Up Now
            </Link>
            <Link 
              href="/login"
              className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-primary-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ZenTurno</h3>
              <p className="text-gray-300">
                Simplifying appointment booking for professionals and clients.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-300 hover:text-white">Home</Link></li>
                <li><Link href="/login" className="text-gray-300 hover:text-white">Sign In</Link></li>
                <li><Link href="/signup" className="text-gray-300 hover:text-white">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-300 hover:text-white">Help Center</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="#" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300 mb-2">info@zenturno.com</p>
              <p className="text-gray-300">+1 (555) 123-4567</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
            <p> 2023 ZenTurno. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
