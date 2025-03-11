import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase, Users, Star, TrendingUp, ShieldCheck, MessageCircle, Globe } from 'lucide-react';
import TaskList from '../components/TaskList';

const Home = () => {
    return (
        <div>
            {/* Hero Section */}
            <div className="relative pt-16 bg-gradient-to-r from-blue-100 to-indigo-100 transform skew-y-6 origin-top-left">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl md:text-6xl font-extrabold">
                                <span className="block">Find Gigs,</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Earn Money Effortlessly</span>
                            </h1>
                            <p className="text-xl text-gray-600">Discover and complete freelance tasks easily with QuickTask.</p>
                            <div className="flex space-x-4">
                                <Link to="/tasks" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-110 transition transform duration-300">Browse Tasks</Link>
                                <Link to="/mytasks" className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-110 transition transform duration-300">Post a Task</Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f" alt="Freelancer at work" className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending & Featured Tasks */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">Trending Tasks</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {[{
                            title: "React Developer Needed",
                            description: "Build a dashboard UI for an upcoming startup.",
                            price: "$200"
                        }, {
                            title: "SEO Content Writer",
                            description: "Write high-ranking articles for a blog.",
                            price: "$80"
                        }, {
                            title: "Virtual Assistant",
                            description: "Assist in email management and scheduling.",
                            price: "$50"
                        }].map((task, index) => (
                            <div key={index} className="bg-gray-100 p-6 shadow-lg rounded-lg hover:bg-gray-200 transition duration-300">
                                <h3 className="font-semibold text-lg">{task.title}</h3>
                                <p className="text-gray-600">{task.description}</p>
                                <span className="block mt-2 text-green-600 font-bold">{task.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI-Powered Job Matching */}
            <div className="py-24 bg-gray-50 text-center">
                <h2 className="text-3xl font-bold">Find Perfect Gigs Instantly</h2>
                <p className="mt-4 text-xl text-gray-600">Let AI match you with the best-paying and relevant tasks.</p>
                <div className="mt-8">
                    <Link to="/ai-matching" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:scale-110 transition duration-300">Try AI Matching</Link>
                </div>
            </div>

            {/* User Testimonials with Animations */}
            <div className="py-24 bg-gradient-to-r from-blue-100 to-indigo-100 text-center">
                <h2 className="text-3xl font-bold">What Our Users Say</h2>
                <div className="grid md:grid-cols-2 gap-12 mt-8">
                    {[{
                        name: "Alice M.",
                        feedback: "QuickTask helped me find gigs that paid instantly! Highly recommend.",
                        rating: 5
                    }, {
                        name: "John D.",
                        feedback: "Posting a task was easy, and I got help within hours. Amazing platform!",
                        rating: 4.5
                    }].map((testimonial, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
                            <p className="italic">"{testimonial.feedback}"</p>
                            <p className="mt-2 font-bold">- {testimonial.name}</p>
                            <div className="flex justify-center mt-2 text-yellow-500">
                                {[...Array(Math.floor(testimonial.rating))].map((_, i) => <Star key={i} className="h-5 w-5" />)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Professional Networking Section */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">Stay Connected & Grow</h2>
                    <p className="text-center text-gray-600 mt-4">Expand your professional network and discover career insights.</p>
                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <div className="bg-gray-100 p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <Users className="mx-auto h-12 w-12 text-blue-600" />
                            <h3 className="font-semibold text-lg mt-4">Build Your Network</h3>
                            <p className="text-gray-600">Connect with professionals and freelancers.</p>
                        </div>
                        <div className="bg-gray-100 p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <Briefcase className="mx-auto h-12 w-12 text-green-600" />
                            <h3 className="font-semibold text-lg mt-4">Career Insights</h3>
                            <p className="text-gray-600">Get industry trends and job market updates.</p>
                        </div>
                        <div className="bg-gray-100 p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <TrendingUp className="mx-auto h-12 w-12 text-yellow-500" />
                            <h3 className="font-semibold text-lg mt-4">Boost Your Profile</h3>
                            <p className="text-gray-600">Showcase your skills and achievements.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
