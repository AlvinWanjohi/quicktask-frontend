import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Briefcase, Users, Star, TrendingUp, ShieldCheck, MessageCircle, Globe, Clock, Filter, Search, ArrowRight, Award, Zap } from 'lucide-react';
import TaskList from '../components/TaskList';

const Home = () => {
    const [topCategories, setTopCategories] = useState([
        { name: "Web Development", count: 156, icon: <Globe className="h-5 w-5" /> },
        { name: "Content Writing", count: 89, icon: <MessageCircle className="h-5 w-5" /> },
        { name: "Virtual Assistant", count: 76, icon: <CheckCircle className="h-5 w-5" /> },
        { name: "Design", count: 68, icon: <Briefcase className="h-5 w-5" /> }
    ]);

    const [featuredTasks, setFeaturedTasks] = useState([
        {
            title: "React Developer Needed",
            description: "Build a dashboard UI for an upcoming startup.",
            price: "$200",
            skills: ["React", "JavaScript", "UI/UX"],
            deadline: "3 days",
            verified: true
        }, 
        {
            title: "SEO Content Writer",
            description: "Write high-ranking articles for a blog.",
            price: "$80",
            skills: ["SEO", "Writing", "Research"],
            deadline: "5 days",
            verified: true
        }, 
        {
            title: "Virtual Assistant",
            description: "Assist in email management and scheduling.",
            price: "$50",
            skills: ["Organization", "Communication", "Time Management"],
            deadline: "2 days",
            verified: false
        }
    ]);

    // Quick search functionality
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearch = (e) => {
        e.preventDefault();
        // In a real app, this would redirect to search results
        console.log("Searching for:", searchTerm);
    };

    // Simulated earnings stats
    const [stats, setStats] = useState({
        totalUsers: 15489,
        tasksCompleted: 28743,
        averageEarnings: "$175"
    });

    return (
        <div>
            {/* Hero Section with Quick Search */}
            <div className="relative pt-16 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-5xl md:text-6xl font-extrabold">
                                <span className="block">Find Gigs,</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Earn Money Effortlessly</span>
                            </h1>
                            <p className="text-xl text-gray-600">Discover and complete freelance tasks easily with QuickTask.</p>
                            
                            {/* Quick Search Bar */}
                            <form onSubmit={handleSearch} className="flex items-center p-2 bg-white rounded-lg shadow-md">
                                <Search className="h-5 w-5 text-gray-400 mx-2" />
                                <input 
                                    type="text" 
                                    placeholder="Search for tasks (e.g. 'web development')" 
                                    className="flex-1 p-2 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700">
                                    Search
                                </button>
                            </form>

                            <div className="flex space-x-4">
                                <Link to="/tasks" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transform hover:scale-105 transition duration-300">Browse Tasks</Link>
                                <Link to="/mytasks" className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-yellow-500 transform hover:scale-105 transition duration-300">Post a Task</Link>
                            </div>
                        </div>
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f" alt="Freelancer at work" className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500" />
                            
                            {/* Floating stat card */}
                            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                                <div className="flex items-center text-blue-600">
                                    <Zap className="h-5 w-5 mr-2" />
                                    <span className="font-bold">Average Earning: {stats.averageEarnings}/week</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Categories Banner */}
                <div className="bg-white py-6 shadow-md transform -skew-y-2 -mt-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transform skew-y-2">
                        <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
                        <div className="flex flex-wrap justify-between items-center">
                            {topCategories.map((category, index) => (
                                <Link key={index} to={'/tasks?category=${category.name}'} className="flex items-center bg-gray-50 p-3 rounded-lg shadow-sm hover:bg-gray-100 transition duration-300 m-2">
                                    <div className="mr-3 bg-blue-100 p-2 rounded-full">
                                        {category.icon}
                                    </div>
                                    <div>
                                        <span className="font-medium">{category.name}</span>
                                        <span className="text-sm text-gray-500 block">{category.count} tasks</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-8 text-center">
                        <div className="bg-blue-50 p-6 rounded-lg shadow">
                            <span className="text-3xl font-bold text-blue-600">{stats.totalUsers.toLocaleString()}</span>
                            <p className="text-gray-600">Active Users</p>
                        </div>
                        <div className="bg-green-50 p-6 rounded-lg shadow">
                            <span className="text-3xl font-bold text-green-600">{stats.tasksCompleted.toLocaleString()}</span>
                            <p className="text-gray-600">Tasks Completed</p>
                        </div>
                        <div className="bg-purple-50 p-6 rounded-lg shadow">
                            <span className="text-3xl font-bold text-purple-600">{stats.averageEarnings}</span>
                            <p className="text-gray-600">Avg. Weekly Earnings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trending & Featured Tasks */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Trending Tasks</h2>
                        <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Filter by:</span>
                            <select className="border rounded-md p-2 bg-white">
                                <option>All Categories</option>
                                <option>Web Development</option>
                                <option>Content Writing</option>
                                <option>Virtual Assistant</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                        {featuredTasks.map((task, index) => (
                            <div key={index} className="bg-gray-50 p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    {task.verified && <ShieldCheck className="h-5 w-5 text-blue-600" title="Verified Poster" />}
                                </div>
                                <p className="text-gray-600 mt-2">{task.description}</p>
                                <div className="flex items-center mt-3 text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    <span>Deadline: {task.deadline}</span>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {task.skills.map((skill, idx) => (
                                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="block text-green-600 font-bold">{task.price}</span>
                                    <Link to={'/tasks/${index}'} className="text-blue-600 hover:underline flex items-center">
                                        View Details <ArrowRight className="h-4 w-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link to="/tasks" className="inline-block border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition duration-300">
                            View All Tasks
                        </Link>
                    </div>
                </div>
            </div>

            {/* AI-Powered Job Matching with Explanation */}
            <div className="py-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold">Find Perfect Gigs Instantly</h2>
                            <p className="mt-4 text-xl">Our AI matches you with the best-paying and relevant tasks based on your skills and preferences.</p>
                            <ul className="mt-6 space-y-3">
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-yellow-300" />
                                    <span>Personalized task recommendations</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-yellow-300" />
                                    <span>Skill gap analysis and course suggestions</span>
                                </li>
                                <li className="flex items-center">
                                    <CheckCircle className="h-5 w-5 mr-2 text-yellow-300" />
                                    <span>Earning potential predictions</span>
                                </li>
                            </ul>
                            <div className="mt-8">
                                <Link to="/ai-matching" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition duration-300">
                                    Try AI Matching
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white p-6 rounded-lg shadow-xl text-black">
                                <h3 className="font-bold text-lg text-purple-600">Your Personalized Dashboard</h3>
                                <div className="mt-4 space-y-3">
                                    <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">React Frontend Developer</span>
                                            <span className="block text-sm text-gray-500">94% match</span>
                                        </div>
                                        <span className="text-green-600 font-bold">$240</span>
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">UX Research Project</span>
                                            <span className="block text-sm text-gray-500">87% match</span>
                                        </div>
                                        <span className="text-green-600 font-bold">$175</span>
                                    </div>
                                    <div className="bg-gray-100 p-3 rounded flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">API Integration Task</span>
                                            <span className="block text-sm text-gray-500">82% match</span>
                                        </div>
                                        <span className="text-green-600 font-bold">$190</span>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-4 -right-4 h-16 w-16 bg-yellow-400 rounded-full opacity-70"></div>
                            <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-pink-400 rounded-full opacity-70"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Testimonials with Animations */}
            <div className="py-16 bg-gray-50 text-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold">What Our Users Say</h2>
                    <div className="grid md:grid-cols-3 gap-6 mt-8">
                        {[{
                            name: "Alice M.",
                            role: "Frontend Developer",
                            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
                            feedback: "QuickTask helped me find gigs that paid instantly! I've been able to earn consistently while working from home.",
                            rating: 5
                        }, {
                            name: "John D.",
                            role: "Business Owner",
                            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
                            feedback: "Posting a task was easy, and I got help within hours. The quality of freelancers here is amazing!",
                            rating: 4.5
                        }, {
                            name: "Sarah K.",
                            role: "Content Writer",
                            image: "https://images.unsplash.com/photo-1517841905240-472988babdf9",
                            feedback: "The AI matching feature is a game-changer. It connects me with perfect tasks for my skills every time.",
                            rating: 5
                        }].map((testimonial, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md transform hover:scale-105 transition duration-300">
                                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 border-2 border-blue-400">
                                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                                </div>
                                <p className="italic text-gray-600">"{testimonial.feedback}"</p>
                                <p className="mt-4 font-bold">{testimonial.name}</p>
                                <p className="text-sm text-gray-500">{testimonial.role}</p>
                                <div className="flex justify-center mt-2 text-yellow-500">
                                    {[...Array(Math.floor(testimonial.rating))].map((_, i) => <Star key={i} className="h-5 w-5" />)}
                                    {testimonial.rating % 1 !== 0 && <Star className="h-5 w-5 text-yellow-500 opacity-50" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center">How QuickTask Works</h2>
                    <div className="grid md:grid-cols-4 gap-8 mt-12">
                        {[{
                            step: 1,
                            title: "Create Profile",
                            description: "Sign up and showcase your skills",
                            icon: <Users className="h-8 w-8 text-blue-600" />
                        }, {
                            step: 2,
                            title: "Find Tasks",
                            description: "Browse or get AI recommendations",
                            icon: <Search className="h-8 w-8 text-blue-600" />
                        }, {
                            step: 3,
                            title: "Complete Work",
                            description: "Deliver quality work on time",
                            icon: <CheckCircle className="h-8 w-8 text-blue-600" />
                        }, {
                            step: 4,
                            title: "Get Paid",
                            description: "Receive payment securely",
                            icon: <TrendingUp className="h-8 w-8 text-blue-600" />
                        }].map((item, index) => (
                            <div key={index} className="relative text-center">
                                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                                    {item.icon}
                                </div>
                                <div className="mt-4">
                                    <span className="inline-block bg-blue-600 text-white w-6 h-6 rounded-full text-sm">
                                        {item.step}
                                    </span>
                                    <h3 className="font-semibold text-lg mt-2">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                                {index < 3 && (
                                    <div className="hidden md:block absolute top-8 w-full">
                                        <div className="h-0.5 bg-blue-200 w-full mt-8"></div>
                                        <ArrowRight className="h-5 w-5 text-blue-300 absolute right-0 top-6" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Professional Networking Section */}
            <div className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold">Stay Connected & Grow</h2>
                        <p className="text-gray-600 mt-4 max-w-2xl mx-auto">Expand your professional network and discover career insights with our community features.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <Users className="mx-auto h-12 w-12 text-blue-600" />
                            <h3 className="font-semibold text-lg mt-4">Build Your Network</h3>
                            <p className="text-gray-600 mt-2">Connect with professionals and freelancers in your industry.</p>
                            <Link to="/networking" className="inline-block mt-4 text-blue-600 hover:underline">Learn More</Link>
                        </div>
                        <div className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <Briefcase className="mx-auto h-12 w-12 text-green-600" />
                            <h3 className="font-semibold text-lg mt-4">Career Insights</h3>
                            <p className="text-gray-600 mt-2">Get industry trends, job market updates, and career advancement tips.</p>
                            <Link to="/insights" className="inline-block mt-4 text-green-600 hover:underline">Explore Insights</Link>
                        </div>
                        <div className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition duration-300 text-center">
                            <Award className="mx-auto h-12 w-12 text-yellow-500" />
                            <h3 className="font-semibold text-lg mt-4">Boost Your Profile</h3>
                            <p className="text-gray-600 mt-2">Showcase your skills, portfolio, and achievements to stand out.</p>
                            <Link to="/profile-tips" className="inline-block mt-4 text-yellow-500 hover:underline">Upgrade Profile</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* New Feature Section - Skills Development Dashboard */}
            <div className="py-16 bg-gradient-to-r from-green-500 to-teal-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold">Develop Your Skills</h2>
                            <p className="mt-4 text-xl">Track your progress and enhance your capabilities with our new skills development dashboard.</p>
                            <div className="mt-6 space-y-4">
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
                                    <h3 className="font-semibold text-lg">Personalized Learning</h3>
                                    <p className="mt-2">Receive customized learning paths based on the skills most in-demand for your chosen fields.</p>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
                                    <h3 className="font-semibold text-lg">Skill Analytics</h3>
                                    <p className="mt-2">Visualize your progress and identify areas for improvement with detailed skill analytics.</p>
                                </div>
                                <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
                                    <h3 className="font-semibold text-lg">Industry Certifications</h3>
                                    <p className="mt-2">Access training resources for in-demand certifications that boost your earning potential.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-lg shadow-xl">
                            <div className="bg-white p-6 text-gray-800">
                                <h3 className="font-bold text-xl text-teal-600 mb-4">Skills Dashboard</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">JavaScript</span>
                                            <span>85%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-teal-600 h-2 rounded-full" style={{width: "85%"}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">React</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-teal-600 h-2 rounded-full" style={{width: "78%"}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="font-medium">UI Design</span>
                                            <span>62%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div className="bg-teal-600 h-2 rounded-full" style={{width: "62%"}}></div>
                                        </div>
                                    </div>
                                    <div className="mt-6">
                                        <h4 className="font-medium mb-2">Recommended Next Steps:</h4>
                                        <ul className="space-y-2 text-sm">
                                            <li className="flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                Complete "Advanced React Patterns" course
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                Practice UI design with 3 portfolio projects
                                            </li>
                                            <li className="flex items-center">
                                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                                Join the Web Development community forum
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
           );
};

export default Home;