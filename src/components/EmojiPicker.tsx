'use client';

import { useState } from 'react';

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const emojiCategories = {
  love: ['❤️', '💕', '💖', '💗', '💘', '💝', '💞', '💟', '💌', '💋', '😍', '🥰', '😘', '😗', '😙', '😚'],
  happy: ['😊', '😄', '😃', '😀', '😁', '😆', '🤗', '🤩', '😇', '🙂', '😉', '😋', '😛', '😜', '🤪', '😝'],
  gestures: ['👍', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✋', '🤚', '👋', '🤙'],
  activities: ['🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🥂', '🍾', '🌹', '🌺', '🌸', '🌼', '🌻', '🌷', '💐', '🎵']
};

export default function EmojiPicker({ isOpen, onClose, onEmojiSelect }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<keyof typeof emojiCategories>('love');

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 left-0 right-0 bg-white border border-pink-200 rounded-2xl shadow-2xl mx-4 z-50">
      {/* Category Tabs */}
      <div className="flex border-b border-pink-100">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
            className={`flex-1 py-3 px-2 text-sm font-medium capitalize transition-colors ${
              activeCategory === category
                ? 'text-pink-600 border-b-2 border-pink-500 bg-pink-50'
                : 'text-gray-500 hover:text-pink-500'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="p-4 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {emojiCategories[activeCategory].map((emoji, index) => (
            <button
              key={index}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className="text-2xl p-2 hover:bg-pink-50 rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Close Button */}
      <div className="p-3 border-t border-pink-100 text-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-pink-500 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
} 