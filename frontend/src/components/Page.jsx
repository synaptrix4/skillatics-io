import { motion } from 'framer-motion'

export default function Page({ children }) {
  return (
    <motion.main
      className="container-page py-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.main>
  )
}


