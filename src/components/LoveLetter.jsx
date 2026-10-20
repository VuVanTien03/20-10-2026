import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { content } from '../config/content';
import HamsterMascot from './HamsterMascot';

export default function LoveLetter() {
  const [open, setOpen] = useState(false);
  return (
    <section className="section letter-section" id="letter">
      <motion.h2
        className="script glow"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        {content.letterTitle}
      </motion.h2>

      <AnimatePresence mode="wait">
        {!open ? (
          <div className="envelope-wrapper">
            <motion.button
              key="env"
              id="open-letter"
              className="envelope"
              onClick={() => setOpen(true)}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              exit={{ opacity: 0, scale: 0.8, y: -40 }}
              whileHover={{ scale: 1.04, rotate: -1.2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.7 }}
              aria-label="Mở thư"
            >
              <span className="env-flap" />
              <span className="env-seal">♥</span>
              <span className="env-text">Chạm để mở thư</span>
            </motion.button>
            <div className="hamster-envelope-pos">
              <HamsterMascot size={120} />
            </div>
          </div>
        ) : (
          <motion.article
            key="paper"
            className="paper"
            initial={{ opacity: 0, y: 60, rotateX: -25 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {content.letter.map((line, i) => (
              <motion.p
                key={i}
                className={i === 0 ? 'letter-hello' : ''}
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.8 + i * 1.1, duration: 1.1 }}
              >
                {line}
              </motion.p>
            ))}
            <div className="letter-sign-container">
              <div className="letter-hamster-wrapper">
                <HamsterMascot size={140} inLetter={true} />
              </div>
              <motion.p
                className="letter-sign"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + content.letter.length * 1.1, duration: 1.4 }}
              >
                {content.letterSign}
                <br />
                <strong>{content.hisName} ♥</strong>
              </motion.p>
            </div>
          </motion.article>
        )}
      </AnimatePresence>
    </section>
  );
}
