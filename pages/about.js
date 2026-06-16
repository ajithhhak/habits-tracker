import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import { Code2, Cpu, Loader2, User, Database, Terminal, Zap, Network, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/useAuth'

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

const BotIcon = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
)

export default function About() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
          <p className="font-medium animate-pulse font-mono">Loading_Profile_Data...</p>
        </div>
      </Layout>
    )
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <Layout user={user}>
      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-5xl mx-auto h-full pb-10">
        
        {/* Terminal/Hacker Window Container */}
        <div className="bg-[#0a0a0a] rounded-sm border border-[#1f1f1f] shadow-2xl overflow-hidden font-mono text-gray-300 relative">
          
          {/* Top Bar */}
          <div className="border-b border-[#1f1f1f] p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#050505]">
            <div className="text-cyan-500 font-bold tracking-widest text-sm mb-4 md:mb-0">
              <span className="text-gray-500">{'>'}</span> [PORTFOLIO]
            </div>
            <div className="flex gap-4 md:gap-6 text-xs text-gray-500 tracking-wider items-center flex-wrap">
              <span className="hover:text-cyan-400 cursor-pointer transition-colors">HOME</span>
              <span className="text-gray-700">|</span>
              <span className="text-cyan-400">ABOUT</span>
              <span className="text-gray-700">|</span>
              <span className="hover:text-cyan-400 cursor-pointer transition-colors">PROJECTS</span>
              <span className="text-gray-700">|</span>
              <span className="hover:text-cyan-400 cursor-pointer transition-colors">EXP_LOGS</span>
              <span className="text-gray-700">|</span>
              <span className="hover:text-cyan-400 cursor-pointer transition-colors">CONNECT</span>
              <a href="https://github.com/ajithhhak" target="_blank" rel="noopener noreferrer" className="border border-cyan-500/50 px-3 py-1 text-cyan-400 hover:bg-cyan-500/10 transition-colors ml-2">
                RESUME.EXE
              </a>
            </div>
          </div>

          <div className="p-4 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Profile Image */}
              <motion.div variants={itemVars} className="lg:col-span-4 border border-[#1f1f1f] p-5 relative group">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
                
                <div className="absolute top-3 left-4 text-[10px] text-cyan-600 tracking-widest">[PROFILE_IMG]</div>
                
                <div className="mt-8 mb-4 flex justify-center">
                  <div className="w-48 h-48 md:w-56 md:h-56 bg-[#111] overflow-hidden rounded-full border-2 border-[#222] grayscale group-hover:grayscale-0 transition-all duration-700">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center flex-col gap-2 bg-[#111]">
                        <User size={64} className="text-gray-700" />
                      </div>
                    )}
                  </div>
                </div>
                
                <h1 className="text-xl font-bold text-white tracking-widest uppercase mt-6 text-center">AJITH_KUMAR</h1>
                <p className="text-cyan-400 text-xs mt-2 text-center leading-relaxed">
                  {'// VLSI Engineer | Robotics Enthusiast'}
                </p>
              </motion.div>

              {/* Right Column: Bio Data */}
              <motion.div variants={itemVars} className="lg:col-span-8 border border-[#1f1f1f] p-6 md:p-8 relative flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
                
                <div className="absolute top-3 left-4 text-[10px] text-cyan-600 tracking-widest">[BIO_DATA]</div>
                
                <div className="mt-4">
                  <div className="text-base md:text-lg mb-6 leading-relaxed">
                    <span className="text-yellow-500 font-bold">const</span> <span className="text-white">tagline</span> <span className="text-cyan-400">=</span> <span className="text-cyan-400">"Building hardware & software systems that solve real-world problems"</span><span className="text-gray-500">;</span>
                  </div>
                  
                  <div className="text-sm text-gray-400 leading-loose font-sans">
                    Aspiring VLSI Engineer and Electronics Engineering Undergrad at <span className="text-gray-200">Sreenidhi Institute of Science and Technology</span>, Hyderabad. 
                    Focused on bridging the gap between hardware and software, building real-world products using C, IoT frameworks, and AI. 
                    Experienced in designing embedded systems workflows, hardware integrations, and exploring the frontiers of Prompt Engineering through academic projects and independent research.
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              
              {/* HARDWARE */}
              <motion.div variants={itemVars} className="border border-[#1f1f1f] p-6 relative hover:border-cyan-500/30 transition-colors group bg-[#080808]">
                <div className="absolute top-3 right-4 text-[10px] text-gray-600 group-hover:text-cyan-600 transition-colors">[01]</div>
                <div className="text-xs text-cyan-500 font-bold tracking-widest mb-6">HARDWARE</div>
                
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex items-center gap-4"><Cpu size={18} className="text-gray-600 group-hover:text-white transition-colors"/> VLSI Design</div>
                  <div className="flex items-center gap-4"><Zap size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Electronics</div>
                  <div className="flex items-center gap-4"><Network size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Embedded Systems</div>
                </div>
              </motion.div>

              {/* SOFTWARE */}
              <motion.div variants={itemVars} className="border border-[#1f1f1f] p-6 relative hover:border-cyan-500/30 transition-colors group bg-[#080808]">
                <div className="absolute top-3 right-4 text-[10px] text-gray-600 group-hover:text-cyan-600 transition-colors">[02]</div>
                <div className="text-xs text-cyan-500 font-bold tracking-widest mb-6">SOFTWARE</div>
                
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex items-center gap-4"><Terminal size={18} className="text-gray-600 group-hover:text-white transition-colors"/> C Programming</div>
                  <div className="flex items-center gap-4"><Code2 size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Next.js & React</div>
                  <div className="flex items-center gap-4"><Database size={18} className="text-gray-600 group-hover:text-white transition-colors"/> IoT Protocols</div>
                </div>
              </motion.div>

              {/* AI & ROBOTICS */}
              <motion.div variants={itemVars} className="border border-[#1f1f1f] p-6 relative hover:border-cyan-500/30 transition-colors group bg-[#080808]">
                <div className="absolute top-3 right-4 text-[10px] text-gray-600 group-hover:text-cyan-600 transition-colors">[03]</div>
                <div className="text-xs text-cyan-500 font-bold tracking-widest mb-6">AI_INTEGRATION</div>
                
                <div className="space-y-4 text-sm text-gray-400">
                  <div className="flex items-center gap-4"><BotIcon size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Artificial Intelligence</div>
                  <div className="flex items-center gap-4"><Cpu size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Robotics</div>
                  <div className="flex items-center gap-4"><Terminal size={18} className="text-gray-600 group-hover:text-white transition-colors"/> Prompt Engineering</div>
                </div>
              </motion.div>

              {/* CONNECT */}
              <motion.div variants={itemVars} className="border border-[#1f1f1f] p-6 relative hover:border-yellow-500/30 transition-colors group bg-[#080808] md:col-span-2 lg:col-span-3 flex flex-col md:flex-row items-start md:items-center justify-between">
                <div>
                  <div className="absolute top-3 right-4 text-[10px] text-gray-600 group-hover:text-yellow-600 transition-colors">[04]</div>
                  <div className="text-xs text-yellow-500 font-bold tracking-widest mb-2">VIEW_FULL</div>
                  <p className="text-xs text-gray-500 font-sans">Reach out for collaborations, hackathons, or opportunities.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-6 md:mt-0">
                  <a href="https://github.com/ajithhhak" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                    <GithubIcon size={18} /> GITHUB
                  </a>
                  <span className="text-gray-700 hidden md:inline">|</span>
                  <a href="https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0a66c2] transition-colors">
                    <LinkedinIcon size={18} /> LINKEDIN
                  </a>
                  <a href="https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7" target="_blank" rel="noopener noreferrer" className="md:ml-4 flex items-center gap-2 text-xs text-yellow-500 hover:text-yellow-400 transition-all">
                    Detailed Profile <ArrowRight size={14} />
                  </a>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  )
}
