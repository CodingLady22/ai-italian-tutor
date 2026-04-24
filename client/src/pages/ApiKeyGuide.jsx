import { ArrowLeft, ExternalLink, Key, ShieldCheck, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ApiKeyGuide() {
  const navigate = useNavigate();

  const steps = [
    {
      title: "1. Go to Google AI Studio",
      description:
        "Visit the Google AI Studio website to access the Gemini API management dashboard.",
      image: "/settings-images/create-key.png",
      action: "https://aistudio.google.com/app/apikey",
    },
    {
      title: "2. Choose a Project",
      description:
        "You can either select an existing Google Cloud project or create a new one for this purpose.",
      image: "/settings-images/select-project.png",
    },
    {
      title: "3. Create New Project (Optional)",
      description:
        "If you don't have a project, click on 'Create API key in new project'.",
      image: "/settings-images/create-new-project.png",
    },
    {
      title: "4. Name Your Project",
      description:
        "Give your project a recognizable name so you can find it later.",
      image: "/settings-images/name-project.png",
    },
    {
      title: "5. Confirm Project Creation",
      description: "Confirm the details and proceed to generate your key.",
      image: "/settings-images/enter-new-project.png",
    },
    {
      title: "6. Create a New API Key",
      description: "Click on the 'Create key' button.",
      image: "/settings-images/create-new-key.png",
    },
    {
      title: "7. Copy Your Key",
      description:
        "Once the key is generated, click the copy button. Make sure to keep it private!",
      image: "/settings-images/copy-key.png",
    },
    {
      title: "8. Success!",
      description:
        "Your key is now copied to your clipboard and ready to be used in Lingua Mente.",
      image: "/settings-images/display-new-key.png",
    },
    {
      title: "9. Paste in Lingua Mente",
      description:
        "Go back to the Dashboard, open Settings, and paste your key into the field provided.",
      image: "/settings-images/key-in-app.png",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-green-600 transition-colors mb-8 group"
        >
          <ArrowLeft
            size={20}
            className="mr-2 group-hover:-translate-x-1 transition-transform"
          />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Key className="text-green-600" size={28} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              How to get a Gemini API Key
            </h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Follow this step-by-step guide to get your free API key from Google
            AI Studio. This will allow you to chat with Lingua Mente using your
            own Gemini quota.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-all hover:shadow-md"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {step.title}
                    </h2>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                  {step.action && (
                    <a
                      href={step.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      Open AI Studio <ExternalLink size={14} />
                    </a>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-auto rounded-lg shadow-sm border border-gray-200"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final Note */}
        <div className="mt-12 bg-green-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={32} />
            <h2 className="text-2xl font-bold">Privacy & Security</h2>
          </div>
          <p className="text-green-50 mb-6 leading-relaxed">
            Your API key is stored only in your account's encrypted settings and
            is never shared. We use it solely to facilitate your personal
            conversation sessions with the Gemini AI.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-green-600 px-8 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
          >
            <Zap size={18} />
            Start Practicing Now
          </button>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>
            © {new Date().getFullYear()} Lingua Mente - Your AI Italian Tutor
          </p>
        </div>
      </div>
    </div>
  );
}
