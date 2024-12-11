import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';
import { ArrowRight } from 'lucide-react';
import { assets } from '../assets/assets';
import { Button } from '../components/ui/Button';

export default function Home() {
  return (
    <div className="relative bg-gradient-to-b from-blue-600 to-blue-400 overflow-hidden min-h-screen flex items-center justify-center">
      {/* Background blur elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[70px] z-0" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/10 rounded-full blur-[50px] z-0" />

      {/* Blurry Circles */}
      <div className="absolute top-1/4 left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute top-[60%] left-[20%] w-72 h-72 bg-white/20 rounded-full blur-2xl"></div>
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/15 rounded-full blur-3xl"></div>

      <main className="container mx-auto px-6 lg:px-16 flex items-center justify-center h-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-4 text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-snug mt-[-10px]">
              Welcome to ProjectHub: <br /> Your Final Project Companion
            </h1>
            <p className="text-base lg:text-lg text-white/90 max-w-md mx-auto lg:mx-0">
              Streamline your journey, whether you're exploring projects or managing them.
            </p>
            {/* Get Started Button */}
            <Button
              asChild
              className="bg-white text-gray-800 hover:bg-gray-100 shadow-md px-6 py-3 text-lg font-semibold"
            >
              <Link to="/login" className="inline-flex items-center gap-3">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>

            {/* Braude Logo */}
            <div className="mt-4">
              <img
                src={assets.braudeLogo}
                alt="Braude College of Engineering"
                className="h-12 w-auto mx-auto lg:mx-0"
                loading="lazy"
              />
            </div>

            {/* Social Links */}
            <div className="flex gap-6 justify-center lg:justify-start pt-4">
              <SocialIcon Icon={FaFacebookF} href="#" />
              <SocialIcon Icon={FaTwitter} href="#" />
              <SocialIcon Icon={FaLinkedinIn} href="#" />
              <SocialIcon Icon={FaYoutube} href="#" />
              <SocialIcon Icon={FaInstagram} href="#" />
            </div>
          </div>

          {/* Right Column */}
          <div className="relative flex items-center justify-center">
            <img
              src={assets.ProjectHubHome}
              alt="ProjectHub Logo"
              className="w-full max-w-[300px] lg:max-w-[400px] object-contain drop-shadow-xl"
              loading="lazy"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SocialIcon({ Icon, href }) {
  return (
    <a href={href} className="text-[#534E4A] hover:text-white transition-colors">
      <Icon className="w-5 h-5" />
    </a>
  );
}
