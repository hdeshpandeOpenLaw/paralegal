const Step = ({ num, title, description }: { num: string, title: string, description: string }) => (
    <div className="flex flex-col items-center text-center">
        <div className="bg-blue-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">{num}</div>
        <h3 className="font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm max-w-xs">{description}</p>
    </div>
);

const HowItWorks = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg mt-8">
        <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800">How it works</h2>
        </div>
        <div className="flex justify-around">
            <Step num="1" title="Ask Your Question" description="Type your legal question or select from popular topics" />
            <Step num="2" title="AI Analysis" description="Our AI analyzes your question and provides relevant information" />
            <Step num="3" title="Get Solutions" description="Receive detailed answers and next steps" />
        </div>
    </div>
);

export default HowItWorks;