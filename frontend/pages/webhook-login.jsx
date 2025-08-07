// frontend/pages/webhook-login.jsx
'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiLock, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';

export default function WebhookLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Animasi variabel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Simulasi autentikasi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (username === 'webhook-admin' && password === 'securePass123!') {
        router.push('/webhook-dashboard');
      } else {
        throw new Error('Kredensial tidak valid');
      }
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-500/10"
            initial={{
              x: Math.random() * 100,
              y: Math.random() * 100,
              size: Math.random() * 10 + 5
            }}
            animate={{
              x: [null, Math.random() * 100],
              y: [null, Math.random() * 100],
              transition: {
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                repeatType: "reverse"
              }
            }}
            style={{
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <FiZap className="text-green-400 text-3xl animate-pulse" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Webhook Portal</h1>
          <p className="text-gray-400">Masuk untuk mengelola integrasi webhook dengan n8n</p>
        </motion.div>

        {/* Form */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-8 border border-gray-700/50 shadow-2xl shadow-green-500/10"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 pl-10 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="webhook-admin"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 pl-10 pr-10 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="��������"
                  required
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-gray-400 hover:text-gray-300" />
                  ) : (
                    <FiEye className="text-gray-400 hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-500/10 text-red-400 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition-all ${
                isLoading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <FiZap />
                  <span>Masuk ke Dashboard</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center text-sm text-gray-500"
          >
            <p>Hanya untuk akses administrator webhook</p>
            <p className="mt-1">Hubungi IT Support jika lupa kredensial</p>
          </motion.div>
        </motion.div>

        {/* Version */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 text-center text-xs text-gray-600"
        >
          Webhook Management v1.0 � {new Date().getFullYear()}
        </motion.div> 
      </motion.div>
    </div>
  );
}