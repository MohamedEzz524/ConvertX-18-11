import { useState, useMemo } from 'react';
import type { FormEvent } from 'react';

// Define which fields are required
const REQUIRED_FIELDS = {
  name: true,
  phoneNumber: true,
  role: true,
  brandIGUsername: true,
  businessGoals: true,
  extraInfo: false,
} as const;

const QualifiedForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    role: '',
    brandIGUsername: '',
    businessGoals: '',
    extraInfo: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | string
  >('idle');

  // Check if all required fields are valid
  const isFormValid = useMemo(() => {
    const allFieldsValid = Object.entries(REQUIRED_FIELDS).every(
      ([fieldName, isRequired]) => {
        if (!isRequired) {
          return true; // Optional fields don't need validation
        }

        const value = formData[fieldName as keyof typeof formData];

        // Check if field is empty
        if (!value.trim()) {
          return false;
        }

        // For all fields, just check if not empty
        return value.trim().length > 0;
      },
    );

    // Check if screenshot is uploaded (required)
    const fileUploaded = screenshot !== null;

    return allFieldsValid && fileUploaded;
  }, [formData, screenshot]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setScreenshot(e.target.files[0]);
  //   }
  // };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        'access_key',
        '8d917ff9-b74d-4901-adf6-2adeb2eb9793',
      );
      formDataToSend.append('subject', 'Contact Form Submission');

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append screenshot if provided
      if (screenshot) {
        formDataToSend.append('screenshot', screenshot);
      }

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formDataToSend,
      });

      // Get response text first to handle both JSON and text responses
      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        console.error('Failed to parse response as JSON:', responseText);
        throw new Error(`Invalid response from server: ${response.status}`);
      }

      console.log('Web3Forms API Response:', result);

      if (!response.ok) {
        throw new Error(
          result.message || `HTTP error! status: ${response.status}`,
        );
      }

      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          phoneNumber: '',
          role: '',
          brandIGUsername: '',
          businessGoals: '',
          extraInfo: '',
        });
        setScreenshot(null);
        // Reset file input
        const fileInput = document.getElementById(
          'screenshot',
        ) as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        const errorMessage =
          result.message ||
          result.error ||
          'Form submission failed. Please check your access key and try again.';
        console.error('Form submission failed:', result);
        setSubmitStatus(`error: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      setSubmitStatus(`error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-20">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Row 1: Name, Phone Number */}
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="name"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={REQUIRED_FIELDS.name}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your name"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="phoneNumber"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required={REQUIRED_FIELDS.phoneNumber}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your phone number"
            />
          </div>
        </div>

        {/* Row 2: Role, Brand IG Username */}
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="role"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Are you the owner of the brand? if not please specify your role
            </label>
            <input
              type="text"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required={REQUIRED_FIELDS.role}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your role"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="brandIGUsername"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Brand IG Username
            </label>
            <input
              type="text"
              id="brandIGUsername"
              name="brandIGUsername"
              value={formData.brandIGUsername}
              onChange={handleChange}
              required={REQUIRED_FIELDS.brandIGUsername}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter brand Instagram username"
            />
          </div>
        </div>

        {/* Row 3: Image Upload */}
        {/* <div className="flex flex-col gap-6">
          <div className="flex-1">
            <label
              htmlFor="screenshot"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Image Upload field for screenshots of the brands' results (shopify
              / meta dashboard screenshot)
            </label>
            <input
              type="file"
              id="screenshot"
              name="screenshot"
              accept="image/*"
              onChange={handleFileChange}
              required
              className="text-textPrimary focus:border-accentPrimary file:bg-accentPrimary hover:file:bg-accentSecondary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none file:mr-4 file:cursor-pointer file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
            {screenshot && (
              <p className="mt-2 text-sm text-slate-400">
                Selected: {screenshot.name}
              </p>
            )}
          </div>
        </div> */}

        {/* Row 4: Business Goals */}
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <label
              htmlFor="businessGoals"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              What are your current business goals and what is holding you back
              from achieving them?
            </label>
            <textarea
              id="businessGoals"
              name="businessGoals"
              value={formData.businessGoals}
              onChange={handleChange}
              required={REQUIRED_FIELDS.businessGoals}
              rows={6}
              className="text-textPrimary focus:border-accentPrimary w-full resize-none border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your business goals and challenges"
            />
          </div>
        </div>

        {/* Row 5: Extra Info */}
        <div className="flex flex-col gap-6">
          <div className="w-full">
            <label
              htmlFor="extraInfo"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Would you like us to know anything extra before having a meeting?
            </label>
            <textarea
              id="extraInfo"
              name="extraInfo"
              value={formData.extraInfo}
              onChange={handleChange}
              required={REQUIRED_FIELDS.extraInfo}
              rows={6}
              className="text-textPrimary focus:border-accentPrimary w-full resize-none border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter any additional information"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center md:justify-start">
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="octagon-button button-gradient w-40 px-12 py-4 font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <div className="mt-6 text-sm text-green-400">
          Thank you! Your message has been sent successfully.
        </div>
      )}
      {submitStatus.toString().startsWith('error') && (
        <div className="mt-6 rounded-lg border border-red-400 bg-red-400/10 p-4 text-sm text-red-400">
          <p className="mb-2 font-semibold">Submission Failed</p>
          <p>
            {submitStatus.toString().includes(':')
              ? submitStatus.toString().split(':')[1].trim()
              : 'Something went wrong. Please try again later.'}
          </p>
          <p className="mt-2 text-xs text-red-300">
            Check the browser console for more details.
          </p>
        </div>
      )}

      {/* Team Contact Information */}
      <div className="text-body mt-8 rounded-lg border border-slate-600 bg-slate-800/30 p-4">
        <p className="text-textPrimary mb-2 text-sm font-medium">
          What happens next?
        </p>
        <p className="text-sm text-slate-400">
          After you submit this form, someone from our team will review your
          submission and contact you within 24-48 hours to validate teh data and
          schedule your discovery call time.
        </p>
      </div>

      {/* Contact Info */}
      <div className="text-body mt-12">
        <p className="mb-2">Reach out directly at</p>
        <a
          href="mailto:agencyconverx@gmail.com"
          className="text-accentPrimary hover:text-accentSecondary trans-colors underline"
        >
          agencyconverx@gmail.com
        </a>
      </div>
    </div>
  );
};

export default QualifiedForm;
