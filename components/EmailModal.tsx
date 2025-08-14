'use client';

import React, { useState } from 'react';

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  fullBody: string;
  timeAgo: string;
  isUnread?: boolean;
  emailClient?: 'google';
}

interface EmailModalProps {
  email: Email | null;
  onClose: () => void;
}

const EmailModal = ({ email, onClose }: EmailModalProps) => {
  const [replying, setReplying] = useState(false);
  const [forwarding, setForwarding] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [forwardTo, setForwardTo] = useState("");
  const [forwardBody, setForwardBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  if (!email) return null;

  const handleReply = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/emails/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.sender,
          subject: `Re: ${email.subject}`,
          body: replyBody,
          originalMessageId: email.id,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to send reply.');
      }
      setReplying(false);
      setReplyBody("");
    } catch (error: any) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const handleForward = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const response = await fetch('/api/emails/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: forwardTo,
          subject: `Fwd: ${email.subject}`,
          body: `${forwardBody}<br><br>---------- Forwarded message ----------<br>From: ${email.sender}<br>Date: ${email.timeAgo}<br>Subject: ${email.subject}<br><br>${email.fullBody}`,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to forward email.');
      }
      setForwarding(false);
      setForwardTo("");
      setForwardBody("");
    } catch (error: any) {
      setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const resetForms = () => {
    setReplying(false);
    setForwarding(false);
    setReplyBody("");
    setForwardTo("");
    setForwardBody("");
    setSendError(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-full flex flex-col">
        {/* Modal Header */}
        <div className="p-8 pb-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-gray-900 flex-1">{email.subject}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors ml-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center mt-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {email.sender.charAt(0)}
            </div>
            <div className="ml-4">
              <div className="font-semibold text-gray-800">{email.sender}</div>
              <div className="text-sm text-gray-500">to me</div>
            </div>
            <div className="ml-auto text-sm text-gray-500">{email.timeAgo}</div>
          </div>
        </div>

        {/* Modal Content (Scrollable) */}
        <div className="p-8 overflow-y-auto flex-1">
          <div 
            className="text-gray-800 text-base leading-relaxed prose max-w-none"
            dangerouslySetInnerHTML={{ __html: email.fullBody }}
          />
        
          {(replying || forwarding) && (
            <div className="pt-8">
              <hr className="mb-6"/>
              {replying && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Reply to {email.sender}</h3>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md"
                    placeholder="Write your reply..."
                  />
                  <div className="flex justify-end items-center mt-4">
                    {sendError && <p className="text-red-500 text-sm mr-4">{sendError}</p>}
                    <button onClick={() => setReplying(false)} className="px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
                    <button onClick={handleReply} disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                      {isSending ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </div>
              )}
              {forwarding && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Forward Email</h3>
                  <input
                    type="email"
                    value={forwardTo}
                    onChange={(e) => setForwardTo(e.target.value)}
                    className="w-full p-2 border rounded-md mb-4"
                    placeholder="Forward to (email address)"
                  />
                  <textarea
                    value={forwardBody}
                    onChange={(e) => setForwardBody(e.target.value)}
                    className="w-full h-32 p-2 border rounded-md"
                    placeholder="Add a message..."
                  />
                  <div className="flex justify-end items-center mt-4">
                    {sendError && <p className="text-red-500 text-sm mr-4">{sendError}</p>}
                    <button onClick={() => setForwarding(false)} className="px-4 py-2 text-sm font-medium text-gray-700">Cancel</button>
                    <button onClick={handleForward} disabled={isSending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                      {isSending ? 'Sending...' : 'Forward'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {!replying && !forwarding && (
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button onClick={() => { setReplying(true); setForwarding(false); }} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Reply</button>
              <button onClick={() => { setForwarding(true); setReplying(false); }} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">Forward</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailModal;
