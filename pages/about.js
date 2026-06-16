import Layout from '../components/Layout'
import { motion } from 'framer-motion'
import { Code2, Cpu, ExternalLink, Info, Loader2 } from 'lucide-react'
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

export default function About() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Layout user={user}>
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <Loader2 className="animate-spin mb-4 text-violet-500" size={32} />
          <p className="font-medium animate-pulse">Loading...</p>
        </div>
      </Layout>
    )
  }

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  return (
    <Layout user={user}>
      <motion.div variants={containerVars} initial="hidden" animate="show" className="max-w-3xl mx-auto space-y-6">
        <motion.div variants={{ hidden: { opacity: 0, y: -20 }, show: { opacity: 1, y: 0 } }}>
          <h1 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
            <Info className="text-violet-500" size={32} />
            About Us
          </h1>
          <p className="text-slate-500 font-medium mt-1">Learn more about the developer behind this project</p>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <Code2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">About the Developer</h2>
              <p className="text-xs text-slate-500 font-medium">Open Source Project</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-800">Ajith Kumar Choudoju</span> — Aspiring VLSI Engineer, Robotics Enthusiast & Electronics Engineering Undergrad at 
              <span className="font-semibold text-slate-700"> Sreenidhi Institute of Science and Technology</span>, Hyderabad. 
              Skilled in IoT & C Programming, currently exploring Embedded Systems, AI & Prompt Engineering. 
              Passionate about building real-world applications that make a difference.
            </p>

            <div className="flex flex-wrap gap-2">
              {['VLSI', 'Robotics', 'IoT', 'C Programming', 'Embedded Systems', 'AI', 'Prompt Engineering', 'Electronics'].map(tag => (
                <span key={tag} className="text-xs font-semibold px-3 py-1 rounded-full border border-violet-200 text-violet-600" style={{ background: '#f5f3ff' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href="https://github.com/ajithhhak" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-200 hover:border-violet-300 transition-all hover:shadow-md group bg-white">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <GithubIcon size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">GitHub</div>
                  <div className="text-xs text-slate-500">@ajithhhak</div>
                </div>
                <ExternalLink size={14} className="text-slate-400 ml-auto" />
              </a>

              <a href="https://www.linkedin.com/in/ajith-kumar-choudoju-37181a2b7" target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-3 px-5 py-3 rounded-xl border border-slate-200 hover:border-blue-300 transition-all hover:shadow-md group bg-white">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform" style={{ background: '#0077B5' }}>
                  <LinkedinIcon size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800">LinkedIn</div>
                  <div className="text-xs text-slate-500">Ajith Kumar Choudoju</div>
                </div>
                <ExternalLink size={14} className="text-slate-400 ml-auto" />
              </a>
            </div>

            <p className="text-xs text-slate-400 font-medium pt-1 flex items-center gap-1.5">
              <Cpu size={12} /> This project is open source — contributions are welcome!
            </p>
          </div>
        </motion.div>
      </motion.div>
    </Layout>
  )
}
