import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import { useAuth } from '../lib/useAuth'
import { Loader2, Github, Linkedin } from 'lucide-react'

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
                  src={user?.avatar || "https://via.placeholder.com/300x300?text=Your+Photo"} 
                  alt="Ajith Kumar" 
                  className="w-full h-full object-cover bg-slate-100"
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
                  <Linkedin size={28} />
                </a>
                <a href="https://github.com/ajithhhak" target="_blank" rel="noreferrer" className="w-14 h-14 rounded-full bg-[#333] text-white flex items-center justify-center hover:scale-110 transition-transform shadow-md">
                  <Github size={28} />
                </a>
              </div>

              {/* Stats like the design */}
              <div className="grid grid-cols-3 gap-6 text-sm text-slate-500 border-t border-slate-100 pt-8">
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">4</span>
                  Projects in<br/>Electronics
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">2</span>
                  Projects in<br/>Software
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-4xl font-bold text-slate-900 mb-1">3+</span>
                  Builds in<br/>Robotics
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
    <motion.div 
      initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
      whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
      className="w-56 h-56 rounded-full shadow-2xl relative flex items-center justify-center"
      style={{
        background: `conic-gradient(
          #111 0% 50%, 
          #8b5cf6 50% 80%, 
          #e2e8f0 80% 100%
        )`
      }}
    >
      {/* Tooltips or labels for the pie chart slices */}
      <div className="absolute top-8 left-8 text-white text-xs font-bold">Hardware</div>
      <div className="absolute bottom-8 right-12 text-white text-xs font-bold">Software</div>
      <div className="absolute top-12 right-6 text-slate-800 text-xs font-bold">Robotics</div>

      {/* Inner circle for donut effect */}
      <div className="bg-white w-28 h-28 rounded-full flex items-center justify-center shadow-inner z-10">
        <span className="font-bold text-slate-800 text-base">Skills</span>
      </div>
    </motion.div>
  )
}
