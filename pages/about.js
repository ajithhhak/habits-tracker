import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth'
import { Loader2 } from 'lucide-react'

const GithubIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
)

const LinkedinIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
)

export default function About() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
          <p className="font-medium animate-pulse font-mono">Loading Profile...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout user={user}>
      <div className="bg-white min-h-full shadow-sm border border-slate-200/60 overflow-hidden text-slate-800 font-sans pb-24 relative">

        {/* Top Black Bar mimicking the design */}
        <div className="bg-[#111] text-white flex justify-between items-center px-6 md:px-12 py-5 relative z-10">
          <div className="font-bold text-xl md:text-2xl tracking-tight flex items-center gap-3">
            <div className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center font-black text-xl">A</div>
            ajithkumar
          </div>
          <div className="hidden md:flex gap-8 text-base font-medium text-gray-400">
            <span className="text-white cursor-pointer">about me</span>
            <span className="hover:text-white cursor-pointer transition-colors">portfolio</span>
            <span className="hover:text-white cursor-pointer transition-colors">projects</span>
            <span className="hover:text-white cursor-pointer transition-colors">blog</span>
            <span className="hover:text-white cursor-pointer transition-colors">contact me</span>
          </div>
        </div>

        {/* Arrow pointer from top bar */}
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#111] absolute left-1/2 -translate-x-1/2 z-10"></div>

        <div className="max-w-5xl mx-auto px-6 pt-20">
          <h1 className="text-4xl md:text-6xl font-normal tracking-tight mb-16 text-center text-slate-900">
            Wow, a whole page just about me!
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 mb-24">
            {/* Photo Section */}
            <div className="mx-auto md:mx-0 relative">
              <div className="bg-white p-2 border border-slate-200 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300 w-64 h-64 md:w-[280px] md:h-[280px]">
                {/* 
                  Since I cannot directly download the image you pasted, I have added a placeholder that will use your avatar if you have one. 
                  To use the picture you provided, please save it as "profile.jpg" in the "public" folder and change the src below to "/profile.jpg"
                */}
                <img
                  src="/profile.jpeg"
                  alt="Ajith Kumar"
                  className="w-full h-full object-cover bg-slate-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://ui-avatars.com/api/?name=Ajith+Kumar&size=300&background=random";
                  }}
                />
              </div>
            </div>

            {/* Intro text */}
            <div className="flex flex-col justify-start">
              <div className="border-b border-slate-300 pb-2 mb-6 inline-block">
                <h2 className="text-2xl font-normal text-slate-800">Me talking about myself</h2>
              </div>

              <p className="text-slate-500 italic text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
                Final-year ECE student bridging hardware and software. I build intelligent electronics, embedded systems, and full-stack web applications, leveraging prompt engineering to optimize workflows and create scalable solutions.
              </p>

              <div className="flex items-center gap-4 mb-10">
                <a href="https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
                  <LinkedinIcon size={28} />
                </a>
                <a href="https://github.com/ajithhhak" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#333] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
                  <GithubIcon size={28} />
                </a>
              </div>

              {/* Stats like the design */}
              <div className="grid grid-cols-3 gap-6 text-sm text-slate-500 border-t border-slate-100 pt-8">
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">4</span>
                  Projects in<br />Electronics
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">2</span>
                  Projects in<br />Software
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">3+</span>
                  Builds in<br />Robotics
                </div>
              </div>
            </div>
          </div>

          {/* Three columns below */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mt-16 pt-16 border-t border-slate-100">

            {/* Left Col */}
            <div>
              <div className="border-b border-slate-300 pb-2 mb-6">
                <h3 className="text-2xl font-normal text-slate-800">I'm a hardware guy</h3>
              </div>
              <ul className="space-y-4 text-slate-600 text-base">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Good at core ECE subjects</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Embedded Systems</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Robotics & Automation</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Hardware integration</li>
              </ul>
            </div>

            {/* Middle Col - Animated Pie Chart */}
            <div className="flex justify-center items-center py-8">
              <PieChart />
            </div>

            {/* Right Col */}
            <div>
              <div className="border-b border-slate-300 pb-2 mb-6">
                <h3 className="text-2xl font-normal text-slate-800">I also do some coding</h3>
              </div>
              <ul className="space-y-4 text-slate-600 text-base">
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> C Language (Proficient)</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Full-stack Web Dev</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Prompt Engineering</li>
                <li className="flex items-center gap-3"><span className="w-2 h-2 bg-slate-800 rounded-full shrink-0"></span> Python & Java</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    </Layout>
  )
}

function PieChart() {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* The rotating pie background */}
      <motion.div
        initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: false, margin: "-50px" }}
        transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
        className="absolute inset-0 rounded-full shadow-2xl"
        style={{
          background: `conic-gradient(
            #111 0% 45%, 
            #e2e8f0 45% 78%, 
            #8b5cf6 78% 100%
          )`
        }}
      />

      {/* Labels positioned precisely over their respective slices (non-rotating) */}

      {/* Hardware: 0% to 45% (Right side) */}
      <div className="absolute top-1/2 right-6 -translate-y-1/2 text-white text-xs font-bold z-10 pointer-events-none text-right">
        Hardware<br /><span className="font-normal opacity-80">44%</span>
      </div>

      {/* Robotics: 45% to 78% (Bottom-Left side) */}
      <div className="absolute bottom-10 left-12 text-slate-800 text-xs font-bold z-10 pointer-events-none">
        Robotics<br /><span className="font-normal opacity-80">34%</span>
      </div>

      {/* Software: 78% to 100% (Top-Left side) */}
      <div className="absolute top-10 left-12 text-white text-xs font-bold z-10 pointer-events-none">
        Software<br /><span className="font-normal opacity-80">22%</span>
      </div>

      {/* Inner circle for donut effect */}
      <div className="bg-white w-28 h-28 rounded-full flex items-center justify-center shadow-inner z-20 relative">
        <span className="font-bold text-slate-800 text-base">Skills</span>
      </div>
    </div>
  )
}
