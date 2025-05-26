'use client';

import React, { useState } from 'react';
import { X, User, Calendar, Palette } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  myName: string;
  onUpdateNames: (myName: string, partnerName: string) => void;
}

export default function Settings({ isOpen, onClose, partnerName, myName, onUpdateNames }: SettingsProps) {
  const [tempMyName, setTempMyName] = useState(myName);
  const [tempPartnerName, setTempPartnerName] = useState(partnerName);
  const [relationshipStart, setRelationshipStart] = useState('');

  const handleSave = () => {
    onUpdateNames(tempMyName, tempPartnerName);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Names Section */}
          <div className="space-y-4">
            <h3 className="text-gray-800 font-medium flex items-center space-x-2">
              <User className="w-4 h-4 text-pink-500" />
              <span>Your Names</span>
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Your Name</label>
                <input
                  type="text"
                  value={tempMyName}
                  onChange={(e) => setTempMyName(e.target.value)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Partner&apos;s Name</label>
                <input
                  type="text"
                  value={tempPartnerName}
                  onChange={(e) => setTempPartnerName(e.target.value)}
                  className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Enter partner's name"
                />
              </div>
            </div>

            <p className="text-gray-600 mb-4">
              お互いの表示名を設定して、より親しみやすいチャットにしましょう
            </p>
          </div>

          {/* Relationship Start Date */}
          <div className="space-y-3">
            <h3 className="text-gray-800 font-medium flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-pink-500" />
              <span>Relationship</span>
            </h3>
            
            <div>
              <label className="block text-sm text-gray-600 mb-1">When did you start dating?</label>
              <input
                type="date"
                value={relationshipStart}
                onChange={(e) => setRelationshipStart(e.target.value)}
                className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Theme Section */}
          <div className="space-y-3">
            <h3 className="text-gray-800 font-medium flex items-center space-x-2">
              <Palette className="w-4 h-4 text-pink-500" />
              <span>Theme</span>
            </h3>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg border-2 border-pink-500 cursor-pointer"></div>
              <div className="h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg border-2 border-transparent hover:border-blue-500 cursor-pointer"></div>
              <div className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg border-2 border-transparent hover:border-green-500 cursor-pointer"></div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
} 