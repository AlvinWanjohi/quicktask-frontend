import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* About QuickTask */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">About QuickTask</h3>
                        <p className="text-gray-400">Connecting freelancers with quick gigs. Earn money effortlessly by completing tasks online.</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/tasks" className="hover:text-yellow-400 transition">Browse Tasks</Link></li>
                            <li><Link to="/mytasks" className="hover:text-yellow-400 transition">Post a Task</Link></li>
                            <li><Link to="/about" className="hover:text-yellow-400 transition">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-yellow-400 transition">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
                        <p className="flex items-center gap-2"><Phone className="h-5 w-5 text-yellow-400" /> +254 740416222</p>
                        <p className="flex items-center gap-2"><Mail className="h-5 w-5 text-yellow-400" /> support@quicktask.com</p>
                    </div>

                    {/* Newsletter Signup */}
                    <div>
                        <h3 className="text-xl font-semibold mb-3">Stay Updated</h3>
                        <p className="text-gray-400">Subscribe to get the latest gigs and offers.</p>
                        <div className="mt-3 flex">
                            <input type="email" placeholder="Enter your email" className="p-2 flex-1 rounded-l-lg text-black focus:outline-none" />
                            <button className="bg-yellow-400 px-4 py-2 rounded-r-lg font-semibold hover:bg-yellow-500 transition">Subscribe</button>
                        </div>
                    </div>
                </div>

                {/* Social Media & Copyright */}
                <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-gray-400">
                    <p>© 2025 QuickTask. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-yellow-400 transition"><Facebook className="h-6 w-6" /></a>
                        <a href="#" className="hover:text-yellow-400 transition"><Twitter className="h-6 w-6" /></a>
                        <a href="#" className="hover:text-yellow-400 transition"><Instagram className="h-6 w-6" /></a>
                        <a href="#" className="hover:text-yellow-400 transition"><Linkedin className="h-6 w-6" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
