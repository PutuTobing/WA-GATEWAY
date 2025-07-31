import { motion } from 'framer-motion';

export default function WebhookPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8"
    >
      <h1 className="text-3xl font-bold text-green-400">Webhook Management</h1>
      {/* Konten halaman */}
    </motion.div>
  );
}