import React, { useState, useEffect, useRef } from 'react';

// Categorize services by pause-ability via email
const PAUSE_CATEGORIES = {
  EMAIL_FRIENDLY: {
    label: 'Email-Friendly',
    description: 'These services often accept email pause requests',
    color: 'emerald',
    icon: '✓'
  },
  HYBRID: {
    label: 'May Work',
    description: 'Success varies; email may work alongside other methods',
    color: 'amber',
    icon: '~'
  },
  ACCOUNT_ONLY: {
    label: 'Account Only',
    description: 'Must be done through your account; email unlikely to work',
    color: 'rose',
    icon: '✗'
  }
};

// Services organized by category and pause method
const SERVICES_DATA = {
  GYM: {
    name: 'Gym Membership',
    pauseCategory: 'HYBRID',
    services: ['Planet Fitness', 'LA Fitness', '24 Hour Fitness', 'Anytime Fitness', 'Crunch Fitness', 'Gold\'s Gym', 'Equinox', 'YMCA'],
    notes: 'Many gyms require in-person visits or certified mail. Some franchises accept email for medical freezes. LA Fitness allows online freezes.',
    typicalDuration: '1-3 months',
    tips: ['Include medical documentation if applicable', 'Reference your membership agreement', 'Request written confirmation']
  },
  MAGAZINE: {
    name: 'Magazine/Newspaper',
    pauseCategory: 'EMAIL_FRIENDLY',
    services: ['The New Yorker', 'Time', 'National Geographic', 'Wired', 'The Economist', 'WSJ', 'NYT', 'The Week'],
    notes: 'Most print publications accept email requests to pause delivery, especially for vacations or temporary holds.',
    typicalDuration: 'Flexible (weeks to months)',
    tips: ['Specify exact pause dates', 'Request delivery hold vs subscription pause', 'Ask about extending subscription end date']
  },
  SUBSCRIPTION_BOX: {
    name: 'Subscription Box',
    pauseCategory: 'HYBRID',
    services: ['HelloFresh', 'Blue Apron', 'Birchbox', 'FabFitFun', 'Dollar Shave Club', 'BarkBox', 'Stitch Fix'],
    notes: 'Most meal kits and boxes require account management. Email may work for smaller/newer services.',
    typicalDuration: 'Per delivery cycle',
    tips: ['Note cutoff dates (usually 5+ days before delivery)', 'Distinguish between skip/pause/cancel', 'Check if pausing extends any promotions']
  },
  SAAS: {
    name: 'SaaS/Software',
    pauseCategory: 'HYBRID',
    services: ['Adobe Creative Cloud', 'Microsoft 365', 'Dropbox', 'Salesforce', 'Slack', 'Zoom', 'Canva'],
    notes: 'Enterprise accounts may accept email requests. Consumer accounts typically require account management.',
    typicalDuration: 'Varies by provider',
    tips: ['Reference contract terms for business accounts', 'Ask about data retention during pause', 'Inquire about prorated credits']
  },
  STREAMING: {
    name: 'Streaming Service',
    pauseCategory: 'ACCOUNT_ONLY',
    services: ['Netflix', 'Hulu', 'Disney+', 'HBO Max', 'Apple TV+', 'Spotify', 'YouTube Premium', 'Amazon Prime Video'],
    notes: 'Streaming services must be paused through account settings. Netflix offers 1-month pause. Most others require cancellation.',
    typicalDuration: 'Usually 1 month max',
    tips: ['Check if pause option exists in account settings', 'Note: pausing preserves watchlist/preferences', 'Consider cancel vs pause tradeoffs']
  },
  MEMBERSHIP: {
    name: 'General Membership',
    pauseCategory: 'HYBRID',
    services: ['Amazon Prime', 'Costco', 'AAA', 'Sam\'s Club', 'BJ\'s Wholesale', 'Audible'],
    notes: 'Warehouse clubs typically don\'t pause. AAA and similar services may accept requests. Audible has built-in pause.',
    typicalDuration: 'Varies widely',
    tips: ['Annual memberships may not allow mid-term pauses', 'Ask about prorated refunds instead', 'Check for seasonal or medical exceptions']
  },
  PHONE: {
    name: 'Phone/Internet',
    pauseCategory: 'EMAIL_FRIENDLY',
    services: ['Verizon', 'AT&T', 'T-Mobile', 'Comcast Xfinity', 'Spectrum', 'Cox'],
    notes: 'Most carriers offer "seasonal suspend" or "vacation hold" via email or written request.',
    typicalDuration: '1-6 months typically',
    tips: ['May incur reduced monthly fee during pause', 'Equipment must remain connected', 'Early termination fees may still apply if under contract']
  },
  INSURANCE: {
    name: 'Insurance',
    pauseCategory: 'ACCOUNT_ONLY',
    services: ['Geico', 'State Farm', 'Progressive', 'Allstate', 'USAA'],
    notes: 'Insurance policies generally cannot be "paused" - you either have coverage or you don\'t. Consider adjusting coverage instead.',
    typicalDuration: 'N/A',
    tips: ['Pausing auto insurance may cause license issues', 'Consider reducing coverage instead', 'Storage insurance may be an alternative for vehicles']
  }
};

// Templates for pause requests
const TEMPLATES = {
  GYM: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Member Services Department

RE: Membership Pause/Freeze Request${data.accountNumber ? ' - Member #' + data.accountNumber : ''}

Dear ${data.serviceName} Team,

I am writing to formally request a temporary pause (freeze) of my gym membership.

Member Details:
- Member Name: ${data.fullName}${data.accountNumber ? '\n- Member Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Membership Type: ' + data.subscriptionPlan : ''}
- Email: ${data.email}

Pause Request:
- Requested Pause Start Date: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Requested Resume Date: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '\n- Duration: Until further notice'}

${data.pauseReason ? `Reason for Pause:\n${data.pauseReason}\n` : ''}I understand that during the pause period:
- My membership access will be suspended
- Monthly dues will be paused or reduced per your freeze policy
- My membership will resume automatically on the specified date (or upon my request)

Please confirm:
1. Receipt of this pause request
2. The effective pause start date
3. Any fees associated with the membership freeze
4. The process to resume my membership

Please send confirmation to ${data.email}.

Thank you for your assistance.

Sincerely,

${data.fullName}`,

  MAGAZINE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Subscription Services

RE: Temporary Subscription Hold Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Subscription Team,

I am writing to request a temporary hold on my subscription.

Subscriber Details:
- Name: ${data.fullName}${data.address ? '\n- Delivery Address: ' + data.address : ''}
- Email: ${data.email}${data.accountNumber ? '\n- Account/Subscription Number: ' + data.accountNumber : ''}

Hold Request:
- Hold Start Date: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Resume Date: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}

${data.pauseReason ? `Reason: ${data.pauseReason}\n` : ''}Please confirm:
- My subscription is paused for the requested period
- No issues will be delivered during the hold
- My subscription end date will be extended accordingly
- Delivery will automatically resume on the specified date

Please send confirmation to ${data.email}.

Thank you.

Sincerely,

${data.fullName}`,

  SUBSCRIPTION_BOX: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Care Team

RE: Subscription Pause Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to request a temporary pause of my subscription.

Subscriber Information:
- Name: ${data.fullName}${data.address ? '\n- Delivery Address: ' + data.address : ''}
- Email: ${data.email}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Subscription Type: ' + data.subscriptionPlan : ''}

Pause Request:
- Pause Starting: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Resume Deliveries: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '\n- Duration: Until I request to resume'}

${data.pauseReason ? `Reason for Pause:\n${data.pauseReason}\n` : ''}Please confirm:
- My subscription is paused effective the requested date
- No further boxes/deliveries will be shipped during the pause
- No charges will be processed during the pause period
- I can resume my subscription when ready

Please send written confirmation to ${data.email}.

Thank you for your flexibility.

Sincerely,

${data.fullName}`,

  SAAS: (data) => `${data.fullName}
${data.email}
${data.address ? data.address + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Billing Department

RE: Subscription Pause Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Team,

I am writing to request a temporary pause of my ${data.serviceName} subscription.

Account Details:
- Account Name: ${data.fullName}
- Email: ${data.email}${data.accountNumber ? '\n- Account/Customer ID: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Current Plan: ' + data.subscriptionPlan : ''}

Pause Request:
- Pause Start Date: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Estimated Resume Date: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}

${data.pauseReason ? `Reason for Pause:\n${data.pauseReason}\n` : ''}During the pause period, please confirm:
1. All recurring billing will be suspended
2. My data and account settings will be preserved
3. I can resume service when ready without losing my configuration
4. Any applicable credits for unused time

Please send confirmation to ${data.email}.

Thank you for your assistance.

Sincerely,

${data.fullName}`,

  STREAMING: (data) => `${data.fullName}
${data.email}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Support

RE: Account Pause Inquiry${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName} Support,

I am writing to inquire about pausing my subscription.

Account Information:
- Account Holder: ${data.fullName}
- Email: ${data.email}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Plan Type: ' + data.subscriptionPlan : ''}

I would like to temporarily pause my subscription starting ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? ' and resume around ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}.

${data.pauseReason ? `Reason: ${data.pauseReason}\n` : ''}Please advise:
- If a pause option is available for my account
- How to process the pause (if via account settings, please confirm)
- Whether my watchlist/preferences will be preserved
- The process to resume when ready

Please respond to ${data.email}.

Thank you.

Best regards,

${data.fullName}`,

  MEMBERSHIP: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Membership Services

RE: Membership Pause Request${data.accountNumber ? ' - Member #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to request a temporary pause of my membership.

Member Information:
- Name: ${data.fullName}${data.accountNumber ? '\n- Member Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Membership Level: ' + data.subscriptionPlan : ''}
- Email: ${data.email}

Pause Request:
- Pause From: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Resume On: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}

${data.pauseReason ? `Reason for Pause:\n${data.pauseReason}\n` : ''}Please confirm:
1. Whether a membership pause is available
2. Any fees or conditions for pausing
3. How benefits are affected during the pause
4. The process to resume when ready

Please send confirmation to ${data.email}.

Thank you for your assistance.

Sincerely,

${data.fullName}`,

  PHONE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Customer Service Department

RE: Seasonal/Vacation Hold Request${data.accountNumber ? ' - Account #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to request a temporary suspension (vacation/seasonal hold) of my service.

Account Information:
- Account Holder: ${data.fullName}${data.address ? '\n- Service Address: ' + data.address : ''}${data.accountNumber ? '\n- Account Number: ' + data.accountNumber : ''}${data.phone ? '\n- Phone Number: ' + data.phone : ''}${data.subscriptionPlan ? '\n- Service Type: ' + data.subscriptionPlan : ''}

Hold Request:
- Hold Start Date: ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? '\n- Service Resume Date: ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}

${data.pauseReason ? `Reason for Hold:\n${data.pauseReason}\n` : ''}Please confirm:
1. The temporary hold is processed for the requested dates
2. Any reduced fees during the suspension period
3. How to restore full service when ready
4. Impact on any contract terms or promotions

Contact me at ${data.email}${data.phone ? ' or ' + data.phone : ''} with confirmation and any questions.

Sincerely,

${data.fullName}`,

  INSURANCE: (data) => `${data.fullName}
${data.address ? data.address + '\n' : ''}${data.email}
${data.phone ? data.phone + '\n' : ''}
${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

${data.serviceName}
Policy Services Department

RE: Coverage Modification Inquiry${data.accountNumber ? ' - Policy #' + data.accountNumber : ''}

Dear ${data.serviceName},

I am writing to inquire about options to temporarily modify or reduce my coverage.

Policy Information:
- Policyholder: ${data.fullName}${data.accountNumber ? '\n- Policy Number: ' + data.accountNumber : ''}${data.subscriptionPlan ? '\n- Policy Type: ' + data.subscriptionPlan : ''}${data.address ? '\n- Address: ' + data.address : ''}

I am looking to temporarily reduce my insurance needs from ${new Date(data.pauseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}${data.pauseEndDate ? ' to approximately ' + new Date(data.pauseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}.

${data.pauseReason ? `Situation:\n${data.pauseReason}\n` : ''}Please advise on:
1. Options to reduce coverage temporarily (e.g., storage insurance for vehicles)
2. Any suspension programs available
3. Impact on premiums and policy terms
4. Process to restore full coverage when needed

Please respond to ${data.email}${data.phone ? ' or call ' + data.phone : ''}.

Thank you for your guidance.

Sincerely,

${data.fullName}`
};

const Tooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="ml-1 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <svg className="w-3.5 h-3.5 inline" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      {show && (
        <div className="absolute left-0 top-6 z-50 w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, placeholder, type = "text", required = false, multiline = false, tooltip, maxLength, showCount = false }) => {
  const baseClasses = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 text-sm placeholder:text-slate-400 shadow-sm";
  
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold text-slate-500 px-0.5 uppercase tracking-wide flex items-center">
        {label} {required && <span className="text-rose-500 ml-1">*</span>}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {multiline ? (
        <>
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={3}
            maxLength={maxLength}
            className={baseClasses}
          />
          {showCount && maxLength && (
            <div className="text-[10px] text-slate-400 text-right">
              {value.length} / {maxLength}
            </div>
          )}
        </>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const cat = PAUSE_CATEGORIES[category];
  const colorMap = {
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    rose: 'bg-rose-100 text-rose-700 border-rose-200'
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colorMap[cat.color]}`}>
      <span>{cat.icon}</span>
      {cat.label}
    </span>
  );
};

const App = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customService, setCustomService] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [userDetails, setUserDetails] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [subDetails, setSubDetails] = useState({
    accountNumber: '',
    subscriptionPlan: '',
    pauseReason: '',
    pauseStartDate: new Date().toISOString().split('T')[0],
    pauseEndDate: ''
  });
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const textareaRef = useRef(null);
  const letterOutputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [generatedLetter]);

  useEffect(() => {
    function postHeight() {
      const root = document.getElementById("root");
      if (!root) return;
      const height = Math.ceil(root.getBoundingClientRect().height);
      window.parent.postMessage({ type: "objectHeight", height }, "*");
    }
    postHeight();
    window.addEventListener("resize", postHeight);
    return () => {
      window.removeEventListener("resize", postHeight);
    };
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedService('');
    setCustomService('');
    setShowCategoryInfo(true);
  };

  const handleServiceChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setSelectedService('');
    } else {
      setSelectedService(value);
      setCustomService('');
    }
  };

  const handleUserChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  const handleSubChange = (e) => {
    setSubDetails({ ...subDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    const serviceName = selectedService || customService;
    if (!serviceName || !userDetails.fullName || !userDetails.email || !selectedCategory) {
      alert('Please fill in all required fields');
      return;
    }

    const template = TEMPLATES[selectedCategory];
    if (template) {
      const letter = template({
        ...userDetails,
        ...subDetails,
        serviceName
      });
      setGeneratedLetter(letter);
      
      setTimeout(() => {
        letterOutputRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLetter);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = generatedLetter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([generatedLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pause-request-${(selectedService || customService).toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentCategoryData = selectedCategory ? SERVICES_DATA[selectedCategory] : null;

  return (
    <div className="flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Sidebar Form */}
      <aside className="w-full lg:w-[420px] xl:w-[460px] bg-white border-b lg:border-b-0 lg:border-r border-slate-200 shadow-xl">
        <div className="p-5 space-y-5">
          {/* Category Selection */}
          <section className="space-y-3">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Subscription Type
            </h2>
            
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 text-sm shadow-sm"
            >
              <option value="">Select a category...</option>
              {Object.entries(SERVICES_DATA).map(([key, data]) => (
                <option key={key} value={key}>{data.name}</option>
              ))}
            </select>

            {/* Category Info Panel */}
            {currentCategoryData && showCategoryInfo && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <CategoryBadge category={currentCategoryData.pauseCategory} />
                  <button 
                    onClick={() => setShowCategoryInfo(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{currentCategoryData.notes}</p>
                <div className="text-[10px] text-slate-500">
                  <strong>Typical pause duration:</strong> {currentCategoryData.typicalDuration}
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Tips:</div>
                  <ul className="text-[10px] text-slate-500 space-y-0.5">
                    {currentCategoryData.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-blue-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Service Selection */}
          {selectedCategory && (
            <section className="space-y-3 pb-4 border-b border-slate-100">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Service Provider
              </h2>
              
              <select
                value={selectedService || (customService ? 'custom' : '')}
                onChange={handleServiceChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 text-sm shadow-sm"
              >
                <option value="">Select a service...</option>
                {SERVICES_DATA[selectedCategory]?.services.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
                <option value="custom">Other (type your own)</option>
              </select>

              {selectedService === '' && (
                <input
                  type="text"
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  placeholder="Enter service name..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-slate-800 text-sm shadow-sm"
                />
              )}
            </section>
          )}

          {/* Pause Dates */}
          {selectedCategory && (
            <section className="space-y-3 pb-4 border-b border-slate-100">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Pause Period
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <InputGroup
                  label="Pause Start"
                  name="pauseStartDate"
                  type="date"
                  value={subDetails.pauseStartDate}
                  onChange={handleSubChange}
                  required
                  tooltip="When you want the pause to begin"
                />
                <InputGroup
                  label="Resume Date"
                  name="pauseEndDate"
                  type="date"
                  value={subDetails.pauseEndDate}
                  onChange={handleSubChange}
                  tooltip="Leave blank for indefinite pause"
                />
              </div>
            </section>
          )}

          {/* User Information */}
          <section className="space-y-3 pb-4 border-b border-slate-100">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Your Information
            </h2>
            <div className="space-y-4">
              <InputGroup 
                label="Full Name" 
                name="fullName" 
                value={userDetails.fullName} 
                onChange={handleUserChange} 
                placeholder="John Doe" 
                required
                tooltip="Your full name as it appears on the account"
              />
              <InputGroup 
                label="Email" 
                name="email" 
                type="email"
                value={userDetails.email} 
                onChange={handleUserChange} 
                placeholder="john@example.com" 
                required
                tooltip="Email where you'll receive confirmation"
              />
            </div>
          </section>

          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            type="button"
            className="w-full py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showAdvanced ? 'Hide' : 'Show'} Optional Fields
          </button>

          {showAdvanced && (
            <section className="space-y-4 pb-4 border-b border-slate-200 animate-fadeIn">
              <InputGroup 
                label="Phone" 
                name="phone" 
                value={userDetails.phone} 
                onChange={handleUserChange} 
                placeholder="(555) 123-4567"
                tooltip="Optional contact phone number"
              />
              <InputGroup 
                label="Mailing Address" 
                name="address" 
                value={userDetails.address} 
                onChange={handleUserChange} 
                placeholder="123 Street, City, State ZIP" 
                multiline
                tooltip="Service or billing address"
              />
              <InputGroup 
                label="Account Number" 
                name="accountNumber" 
                value={subDetails.accountNumber} 
                onChange={handleSubChange} 
                placeholder="Optional"
                tooltip="Your account or member ID"
              />
              <InputGroup 
                label="Plan/Type" 
                name="subscriptionPlan" 
                value={subDetails.subscriptionPlan} 
                onChange={handleSubChange} 
                placeholder="e.g. Premium, Basic"
                tooltip="Your subscription tier or plan"
              />
              <InputGroup 
                label="Reason for Pause" 
                name="pauseReason" 
                value={subDetails.pauseReason} 
                onChange={handleSubChange} 
                placeholder="Travel, medical, financial..." 
                multiline
                maxLength={200}
                showCount={true}
                tooltip="Brief reason (can help with approval)"
              />
            </section>
          )}

          <button
            onClick={handleSubmit}
            type="button"
            className="w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Generate Pause Request</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Letter Preview */}
      <main 
        ref={letterOutputRef}
        className="lg:flex-1 bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-10 xl:p-14"
      >
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Preview & Edit</h2>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={downloadTxt}
                disabled={!generatedLetter}
                type="button"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-bold shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!generatedLetter}
                type="button"
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg border font-bold text-xs transition-all shadow-sm ${
                  copySuccess 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {copySuccess ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden lg:min-h-[400px]">
            {!generatedLetter ? (
              <div className="flex flex-col items-center justify-center text-center p-12 lg:p-20">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-100 flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-slate-700 font-bold text-lg">Your pause request will appear here</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-sm">Select a subscription type, fill out the required fields, and click Generate</p>
              </div>
            ) : (
              <div className="p-8 sm:p-10 lg:p-14">
                <textarea
                  ref={textareaRef}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  className="w-full resize-none border-none outline-none text-base text-slate-800 leading-relaxed bg-transparent focus:ring-0 overflow-hidden"
                  style={{ fontFamily: "'SF Mono', 'Fira Code', 'Monaco', monospace", fontSize: '13px', lineHeight: '1.7' }}
                  spellCheck={false}
                />
                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                  <span>Pause Request Generated</span>
                  <span>Review before sending</span>
                </div>
              </div>
            )}
          </div>

          {/* Info boxes */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-50 border border-blue-200 rounded-xl">
              <div className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                When email works best
              </div>
              <div className="text-[11px] text-blue-800 leading-relaxed">
                Email pause requests work well for gyms (especially medical freezes), magazines, newspapers, and some B2B/enterprise software. Streaming services, app store purchases, and most modern subscription boxes require you to pause through your account settings.
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Important tips
              </div>
              <ul className="text-[11px] text-amber-800 leading-relaxed space-y-1">
                <li>• Always check your account dashboard first — many services have self-serve pause options</li>
                <li>• Keep a copy of your request and any confirmation emails</li>
                <li>• Follow up if you don't receive confirmation within 5-7 business days</li>
                <li>• For gyms, a doctor's note often enables free freezes for medical reasons</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
