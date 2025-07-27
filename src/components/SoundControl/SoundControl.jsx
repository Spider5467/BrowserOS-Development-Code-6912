import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiVolume, FiVolume1, FiVolume2, FiVolumeX, FiMusic, FiRadio, FiAlertCircle, FiSliders } = FiIcons;

const SoundControl = ({ darkMode = false }) => {
  const [masterVolume, setMasterVolume] = useState(50);
  const [mediaVolume, setMediaVolume] = useState(80);
  const [notificationVolume, setNotificationVolume] = useState(60);
  const [systemVolume, setSystemVolume] = useState(40);
  const [muted, setMuted] = useState(false);
  
  // Load sound settings from localStorage
  useEffect(() => {
    try {
      const savedMasterVolume = localStorage.getItem('browserOS_masterVolume');
      const savedMediaVolume = localStorage.getItem('browserOS_mediaVolume');
      const savedNotificationVolume = localStorage.getItem('browserOS_notificationVolume');
      const savedSystemVolume = localStorage.getItem('browserOS_systemVolume');
      const savedMuted = localStorage.getItem('browserOS_muted');
      
      if (savedMasterVolume) setMasterVolume(parseInt(savedMasterVolume, 10));
      if (savedMediaVolume) setMediaVolume(parseInt(savedMediaVolume, 10));
      if (savedNotificationVolume) setNotificationVolume(parseInt(savedNotificationVolume, 10));
      if (savedSystemVolume) setSystemVolume(parseInt(savedSystemVolume, 10));
      if (savedMuted) setMuted(savedMuted === 'true');
    } catch (error) {
      console.error('Error loading sound settings:', error);
    }
  }, []);
  
  // Save sound settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('browserOS_masterVolume', masterVolume.toString());
      localStorage.setItem('browserOS_mediaVolume', mediaVolume.toString());
      localStorage.setItem('browserOS_notificationVolume', notificationVolume.toString());
      localStorage.setItem('browserOS_systemVolume', systemVolume.toString());
      localStorage.setItem('browserOS_muted', muted.toString());
    } catch (error) {
      console.error('Error saving sound settings:', error);
    }
  }, [masterVolume, mediaVolume, notificationVolume, systemVolume, muted]);
  
  const toggleMute = () => {
    setMuted(!muted);
    
    // Play a sound effect when unmuting
    if (muted) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBwTjM1TGmEoMDa6OnVuJdoRyQcN1dzhKi20tzm7OrdxaeAWzYhHi5JVmBqiLfX6+PRtIdYNiUvRlVea4/F3/Lx6Mydc1EzKj9LSlAzNFmEp8XY4ed7SSgqPE9IQjQ5W4iuyd/q5Nh2QDVCYXV1TDhLdJGtvdDc4stELztYcmUyJUFnlbzW5ObWbCsYN2N9dn1SHjJQdJ+70u2rTkBQcnlrTTBJbZO00eTP7pMqPWmMkoBPIzZTfKnH3t7Mah8mQ2R8dFwpMlJ5pMHa5dB+FypDZH13XRUWMWmawuPaGh4YKFmXp4xaJC9DbZW/1+PQVB4oR2iEgmMiJUdwmcDa5s1nHSE8XHl1XCgvT32wyN7jyFUbI0Nne3NfKjVVgqzJ3OPEUBkiQGJ4cVgiLVB+rMre5cRQFiA+YHhyVxYgRHOnx9/nv00bITxbd3JcKzVTfqnI3OS+TBohPV12c1shLk53qMfc5LtFGSA8W3RxXCovTXiow93muUoZHztac3BbJzJQe6vI3ea5RxkfO1ly8Lsu98uwre7DtOvPweHz18LL9Mmr5cCw6dO/7vfd0PT6xKjmvq3p0L3u+OHY9v7Hq+e/r+rTv+/65Nz6C8aq5rqs6tS/7/vl3fz7w6XjtqXr1sLy/ebf/vbDpuS1pOvYxPP85uD//cWo5bWj69rG9f3n4f//yKzptqPs28j2/ejh///Lseu4pO3cyvf+6eL//82w7buj7d3L9/7p4v//zrLvvKbt3cv3/uni///Ps/C/p+7fzPj+6eP//9C08MKo7uDN+f/q4///0rXxxKnv4c34/+vk///UtfLHqvDiz/n/7OX//9a28siq8OPQ+v/t5f//2LfzyKvx5NH6/+7m///auPTJrPLl0vv/7uf//9y59Mqs8ubT/P/v5///3rr1zK3z59T8//Do///gu/XOrvPo1P3/8ej//+K89c+v9OjV/f/x6f//5L32z6/06dX+//Lq///lvfbPsPTp1v7/8ur//+a+9tCw9erW/v/y6v//6L/30bH269f+//Pr///pwPfSsvbt1///8+v//+vB99Oz9u7Y///z7P//7ML307P379n///Ts///twvfUtPfv2f//9e3//+/D+NW09/DZ///17f//8MT41rX48dr///bu///xxPnWtfjy2////u7///LF+dq2+fLb///+7v//9Mb62bb689v////v///1x/rct/rz3P////D///bI+t24+vTc/////P//98n637n79dz/////8P/4yvrguvv13f/////w//rL++G7+/be//////D/+8z747z799//////8f/8zfvkvfv33v/////x//3O/OW/+/jf//////L//s/85r/8+N////////P//9D96MD8+eD///////P//9H96cH9+uH///////T//9L+6sL9+uH///////X//9P/7MP9++L///////X//9T/7cT+/OP///////b//9X/7sX+/OP///////f//9b/78b+/eT///////j//9f/8Mf+/eX///////n//9n/8cf+/uX///////r//9r/8sj+/+b///////v//9v/88n+/+f///////z//9z/9Mr//////P//3f/1y//////9//7e//bL///////+/v/f//fM////////4P/4zf///////+H/+c7////////i//rP////////4//70P///////+T//NH////////l//3S////////5v/+0////////+f//9P////////n///U////////6P//1f///////+n//9b////////q///X////////6///2P///////+z//9n////////t///a////////7v//2//////////v///c////////8P//3f///////+b//+r///////+F').play();
      } catch (error) {
        console.error('Error playing sound effect:', error);
      }
    }
  };
  
  const getVolumeIcon = () => {
    if (muted) return FiVolumeX;
    if (masterVolume > 70) return FiVolume2;
    if (masterVolume > 30) return FiVolume1;
    return FiVolume;
  };

  return (
    <div className={`h-full flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} text-white p-6`}>
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <SafeIcon icon={getVolumeIcon()} className="mr-3 text-indigo-400" />
        Sound Control
      </h2>
      
      {/* Master Volume */}
      <div className={`p-5 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg mb-6 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-lg">Master Volume</h3>
          <motion.button
            className="p-2 rounded-full hover:bg-gray-600"
            onClick={toggleMute}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <SafeIcon icon={muted ? FiVolumeX : getVolumeIcon()} className={muted ? "text-red-500" : ""} />
          </motion.button>
        </div>
        
        <div className="flex items-center">
          <SafeIcon icon={FiVolume} className="mr-3 text-gray-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseInt(e.target.value, 10))}
            disabled={muted}
            className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${muted ? 'opacity-50' : ''}`}
            style={{
              backgroundImage: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${masterVolume}%, #4b5563 ${masterVolume}%, #4b5563 100%)`
            }}
          />
          <span className="ml-3 w-8 text-right">{masterVolume}%</span>
        </div>
      </div>
      
      {/* Individual Volume Controls */}
      <div className="space-y-4">
        {/* Media Volume */}
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg`}>
          <div className="flex items-center mb-2">
            <SafeIcon icon={FiMusic} className="mr-2 text-indigo-400" />
            <h4 className="font-medium">Media</h4>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : mediaVolume}
              onChange={(e) => setMediaVolume(parseInt(e.target.value, 10))}
              disabled={muted}
              className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${muted ? 'opacity-50' : ''}`}
              style={{
                backgroundImage: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${muted ? 0 : mediaVolume}%, #4b5563 ${muted ? 0 : mediaVolume}%, #4b5563 100%)`
              }}
            />
            <span className="ml-3 w-8 text-right">{muted ? 0 : mediaVolume}%</span>
          </div>
        </div>
        
        {/* Notification Volume */}
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg`}>
          <div className="flex items-center mb-2">
            <SafeIcon icon={FiAlertCircle} className="mr-2 text-indigo-400" />
            <h4 className="font-medium">Notifications</h4>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : notificationVolume}
              onChange={(e) => setNotificationVolume(parseInt(e.target.value, 10))}
              disabled={muted}
              className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${muted ? 'opacity-50' : ''}`}
              style={{
                backgroundImage: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${muted ? 0 : notificationVolume}%, #4b5563 ${muted ? 0 : notificationVolume}%, #4b5563 100%)`
              }}
            />
            <span className="ml-3 w-8 text-right">{muted ? 0 : notificationVolume}%</span>
          </div>
        </div>
        
        {/* System Volume */}
        <div className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg`}>
          <div className="flex items-center mb-2">
            <SafeIcon icon={FiSliders} className="mr-2 text-indigo-400" />
            <h4 className="font-medium">System</h4>
          </div>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : systemVolume}
              onChange={(e) => setSystemVolume(parseInt(e.target.value, 10))}
              disabled={muted}
              className={`w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer ${muted ? 'opacity-50' : ''}`}
              style={{
                backgroundImage: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${muted ? 0 : systemVolume}%, #4b5563 ${muted ? 0 : systemVolume}%, #4b5563 100%)`
              }}
            />
            <span className="ml-3 w-8 text-right">{muted ? 0 : systemVolume}%</span>
          </div>
        </div>
      </div>
      
      {/* Sound Test */}
      <div className="mt-auto pt-4">
        <h4 className="text-gray-400 text-sm mb-2">Test Sound</h4>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg flex items-center justify-center hover:bg-indigo-600`}
            onClick={() => {
              if (!muted) {
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBwTjM1TGmEoMDa6OlvRyQcN1dzhKi20tzm7OrdxaeAWzYhHi5JVmBqiLfX6+PRtIdYNiUvRlVea4/F3/Lx6Mydc1EzKj9LSlAzNFmEp8XY4ed7SSgqPE9IQjQ5W4iuyd/q5Nh2QDVCYXV1TDhLdJGtvdDc4stELztYcmUyJUFnlbzW5ObWbCsYN2N9dn1SHjJQdJ+70u2rTkBQcnlrTTBJbZO00eTP7pMqPWmMkoBPIzZTfKnH3t7Mah8mQ2R8dFwpMlJ5pMHa5dB+FypDZH13XRUWMWmawuPaGh4YKFmXp4xaJC9DbZW/1+PQVB4oR2iEgmMiJUdwmcDa5s1nHSE8XHl1XCgvT32wyN7jyFUbI0Nne3NfKjVVgqzJ3OPEUBkiQGJ4cVgiLVB+rMre5cRQFiA+YHhyVxYgRHOnx9/nv00bITxbd3JcKzVTfqnI3OS+TBohPV12c1shLk53qMfc5LtFGSA8W3RxXCovTXiow93muUoZHztac3BbJzJQe6vI3ea5RxkfO1ly8Lsu98uwre7DtOvPweHz18LL9Mmr5cCw6dO/7vfd0PT6xKjmvq3p0L3u+OHY9v7Hq+e/r+rTv+/65Nz6C8aq5rqs6tS/7/vl3fz7w6XjtqXr1sLy/ebf/vbDpuS1pOvYxPP85uD//cWo5bWj69rG9f3n4f//yKzptqPs28j2/ejh///Lseu4pO3cyvf+6eL//82w7buj7d3L9/7p4v//zrLvvKbt3cv3/uni///Ps/C/p+7fzPj+6eP//9C08MKo7uDN+f/q4///0rXxxKnv4c34/+vk///UtfLHqvDiz/n/7OX//9a28siq8OPQ+v/t5f//2LfzyKvx5NH6/+7m///auPTJrPLl0vv/7uf//9y59Mqs8ubT/P/v5///3rr1zK3z59T8//Do///gu/XOrvPo1P3/8ej//+K89c+v9OjV/f/x6f//5L32z6/06dX+//Lq///lvfbPsPTp1v7/8ur//+a+9tCw9erW/v/y6v//6L/30bH269f+//Pr///pwPfSsvbt1///8+v//+vB99Oz9u7Y///z7P//7ML307P379n///Ts///twvfUtPfv2f//9e3//+/D+NW09/DZ///17f//8MT41rX48dr///bu///xxPnWtfjy2////u7///LF+dq2+fLb///+7v//9Mb62bb689v////v///1x/rct/rz3P////D///bI+t24+vTc/////P//98n637n79dz/////8P/4yvrguvv13f/////w//rL++G7+/be//////D/+8z747z799//////8f/8zfvkvfv33v/////x//3O/OW/+/jf//////L//s/85r/8+N////////P//9D96MD8+eD///////P//9H96cH9+uH///////T//9L+6sL9+uH///////X//9P/7MP9++L///////X//9T/7cT+/OP///////b//9X/7sX+/OP///////f//9b/78b+/eT///////j//9f/8Mf+/eX///////n//9n/8cf+/uX///////r//9r/8sj+/+b///////v//9v/88n+/+f///////z//9z/9Mr//////P//3f/1y//////9//7e//bL///////+/v/f//fM////////4P/4zf///////+H/+c7////////i//rP////////4//70P///////+T//NH////////l//3S////////5v/+0////////+f//9P////////n///U////////6P//1f///////+n//9b////////q///X////////6///2P///////+z//9n////////t///a////////7v//2//////////v///c////////8P//3f///////+b//+r///////+F');
                  audio.volume = (masterVolume / 100) * (systemVolume / 100);
                  audio.play();
                } catch (error) {
                  console.error('Error playing sound effect:', error);
                }
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiRadio} className="mr-2" />
            System Sound
          </motion.button>
          
          <motion.button
            className={`p-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-700'} rounded-lg flex items-center justify-center hover:bg-indigo-600`}
            onClick={() => {
              if (!muted) {
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBwTjM1TGmEoMDa6OlvRyQcN1dzhKi20tzm7OrdxaeAWzYhHi5JVmBqiLfX6+PRtIdYNiUvRlVea4/F3/Lx6Mydc1EzKj9LSlAzNFmEp8XY4ed7SSgqPE9IQjQ5W4iuyd/q5Nh2QDVCYXV1TDhLdJGtvdDc4stELztYcmUyJUFnlbzW5ObWbCsYN2N9dn1SHjJQdJ+70u2rTkBQcnlrTTBJbZO00eTP7pMqPWmMkoBPIzZTfKnH3t7Mah8mQ2R8dFwpMlJ5pMHa5dB+FypDZH13XRUWMWmawuPaGh4YKFmXp4xaJC9DbZW/1+PQVB4oR2iEgmMiJUdwmcDa5s1nHSE8XHl1XCgvT32wyN7jyFUbI0Nne3NfKjVVgqzJ3OPEUBkiQGJ4cVgiLVB+rMre5cRQFiA+YHhyVxYgRHOnx9/nv00bITxbd3JcKzVTfqnI3OS+TBohPV12c1shLk53qMfc5LtFGSA8W3RxXCovTXiow93muUoZHztac3BbJzJQe6vI3ea5RxkfO1ly8Lsu98uwre7DtOvPweHz18LL9Mmr5cCw6dO/7vfd0PT6xKjmvq3p0L3u+OHY9v7Hq+e/r+rTv+/65Nz6C8aq5rqs6tS/7/vl3fz7w6XjtqXr1sLy/ebf/vbDpuS1pOvYxPP85uD//cWo5bWj69rG9f3n4f//yKzptqPs28j2/ejh///Lseu4pO3cyvf+6eL//82w7buj7d3L9/7p4v//zrLvvKbt3cv3/uni///Ps/C/p+7fzPj+6eP//9C08MKo7uDN+f/q4///0rXxxKnv4c34/+vk///UtfLHqvDiz/n/7OX//9a28siq8OPQ+v/t5f//2LfzyKvx5NH6/+7m///auPTJrPLl0vv/7uf//9y59Mqs8ubT/P/v5///3rr1zK3z59T8//Do///gu/XOrvPo1P3/8ej//+K89c+v9OjV/f/x6f//5L32z6/06dX+//Lq///lvfbPsPTp1v7/8ur//+a+9tCw9erW/v/y6v//6L/30bH269f+//Pr///pwPfSsvbt1///8+v//+vB99Oz9u7Y///z7P//7ML307P379n///Ts///twvfUtPfv2f//9e3//+/D+NW09/DZ///17f//8MT41rX48dr///bu///xxPnWtfjy2////u7///LF+dq2+fLb///+7v//9Mb62bb689v////v///1x/rct/rz3P////D///bI+t24+vTc/////P//98n637n79dz/////8P/4yvrguvv13f/////w//rL++G7+/be//////D/+8z747z799//////8f/8zfvkvfv33v/////x//3O/OW/+/jf//////L//s/85r/8+N////////P//9D96MD8+eD///////P//9H96cH9+uH///////T//9L+6sL9+uH///////X//9P/7MP9++L///////X//9T/7cT+/OP///////b//9X/7sX+/OP///////f//9b/78b+/eT///////j//9f/8Mf+/eX///////n//9n/8cf+/uX///////r//9r/8sj+/+b///////v//9v/88n+/+f///////z//9z/9Mr//////P//3f/1y//////9//7e//bL///////+/v/f//fM////////4P/4zf///////+H/+c7////////i//rP////////4//70P///////+T//NH////////l//3S////////5v/+0////////+f//9P////////n///U////////6P//1f///////+n//9b////////q///X////////6///2P///////+z//9n////////t///a////////7v//2//////////v///c////////8P//3f///////+b//+r///////+F');
                  audio.volume = (masterVolume / 100) * (notificationVolume / 100);
                  audio.play();
                } catch (error) {
                  console.error('Error playing notification sound:', error);
                }
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiAlertCircle} className="mr-2" />
            Notification
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SoundControl;