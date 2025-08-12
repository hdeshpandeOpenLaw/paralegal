"use client";
import Image from 'next/image';
import { useState } from 'react';

const Modal = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
        <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            {children}
        </div>
    </div>
);

const Insight = ({ title, description, urgency, timeAgo, onClick }: {
    title: string,
    description: string,
    urgency: 'High' | 'Medium',
    timeAgo: string,
    onClick: () => void
}) => (
    <div className="flex items-start justify-between p-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50" onClick={onClick}>
        <div className="flex-1">
            <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    urgency === 'High' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'
                }`}>
                    {urgency}
                </span>
                <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>
        </div>
    </div>
);

const insightsData = [
    {
        title: "New Employment Law Updates",
        description: "Recent changes in labor regulations affecting client...",
        fullDescription: "The latest legislative session introduced several key changes to employment law, including new regulations on overtime pay, independent contractor classifications, and family leave policies. These changes will have a significant impact on businesses and require immediate attention to ensure compliance.",
        urgency: "High",
        timeAgo: "2 days ago"
    },
    {
        title: "Contract Dispute Trends",
        description: "Analysis of recent court decisions in contract law",
        fullDescription: "A review of recent appellate court decisions reveals a growing trend towards stricter enforcement of non-compete clauses and arbitration agreements. Attorneys should advise clients to review and update their standard contract templates accordingly.",
        urgency: "Medium",
        timeAgo: "1 week ago"
    },
    {
        title: "Intellectual Property Alerts",
        description: "Updated guidelines for patent applications",
        fullDescription: "The USPTO has issued new guidance on patent eligibility for software-related inventions, clarifying the requirements under 35 U.S.C. § 101. This will affect how patent applications are drafted and prosecuted for tech clients.",
        urgency: "High",
        timeAgo: "3 days ago"
    },
    {
        title: "Tax Law Changes",
        description: "New tax regulations impacting business clients...",
        fullDescription: "The recent tax reform bill includes significant changes to corporate tax rates, deductions for pass-through entities, and international tax provisions. These changes necessitate a thorough review of tax planning strategies for all business clients.",
        urgency: "Medium",
        timeAgo: "5 days ago"
    },
];

const ImportantInsights = () => {
    const [selectedInsight, setSelectedInsight] = useState<(typeof insightsData[0]) | null>(null);

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-gray-800">Important Insights</h2>
                <p className="text-gray-500 mb-4">Key updates and trends for attorneys</p>
                <div className="space-y-2">
                    {insightsData.map((insight, index) => (
                        <Insight
                            key={index}
                            title={insight.title}
                            description={insight.description}
                            urgency={insight.urgency as 'High' | 'Medium'}
                            timeAgo={insight.timeAgo}
                            onClick={() => setSelectedInsight(insight)}
                        />
                    ))}
                </div>
            </div>

            {selectedInsight && (
                <Modal onClose={() => setSelectedInsight(null)}>
                    <h2 className="text-2xl font-bold mb-4">{selectedInsight.title}</h2>
                    <p className="text-gray-700 mb-4">{selectedInsight.fullDescription}</p>
                    <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedInsight.urgency === 'High' ? 'bg-pink-100 text-pink-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                            {selectedInsight.urgency}
                        </span>
                        <span className="text-sm text-gray-500">{selectedInsight.timeAgo}</span>
                    </div>
                </Modal>
            )}
        </>
    );
};


export default ImportantInsights;
