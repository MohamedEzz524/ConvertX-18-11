import { useState, useMemo } from 'react';
import type { FormEvent, ChangeEvent } from 'react';

// Define which fields are required (no * = optional)
const REQUIRED_FIELDS = {
  name: true,
  email: true,
  phone: true,
  instagramUser: true,
  revenueLastMonth: true,
  adSpendLastMonth: true,
  upcomingCollections: true,
  additionalNotes: false,
} as const;

// Email validation helper
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const DisqualifiedForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagramUser: '',
    revenueLastMonth: '',
    adSpendLastMonth: '',
    upcomingCollections: '',
    additionalNotes: '',
  });
  const [transactionScreenshot, setTransactionScreenshot] =
    useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error' | string
  >('idle');

  // Check if all required fields are valid
  const isFormValid = useMemo(() => {
    // Check all form fields
    const allFieldsValid = Object.entries(REQUIRED_FIELDS).every(
      ([fieldName, isRequired]) => {
        if (!isRequired) return true;

        const value = formData[fieldName as keyof typeof formData];

        if (!value.trim()) return false;

        if (fieldName === 'email') {
          return isValidEmail(value);
        }

        return value.trim().length > 0;
      },
    );

    // Check if transaction screenshot is uploaded (required)
    const fileUploaded = transactionScreenshot !== null;

    return allFieldsValid && fileUploaded;
  }, [formData, transactionScreenshot]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTransactionScreenshot(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append(
        'access_key',
        '412ac78b-9afd-41dc-ad57-f24e92ecf010',
      );
      formDataToSend.append('subject', 'Brand Intake Form Submission');

      // Append all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append transaction screenshot if provided
      if (transactionScreenshot) {
        formDataToSend.append('transactionScreenshot', transactionScreenshot);
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
          email: '',
          phone: '',
          instagramUser: '',
          revenueLastMonth: '',
          adSpendLastMonth: '',
          upcomingCollections: '',
          additionalNotes: '',
        });
        setTransactionScreenshot(null);
        // Reset file input
        const fileInput = document.getElementById(
          'transactionScreenshot',
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
      {/* Consultation Cost Notice */}
      <div className="border-accentPrimary bg-accentPrimary/10 mb-8 rounded-lg border-2 p-6 text-center">
        <h3 className="text-textPrimary mb-2 text-xl font-bold">
          Consultation Fee: 100$
        </h3>
        <p className="text-body text-sm">
          Please note that the consultation requires full payment upfront. After
          submitting this form and confirming your transaction, someone from our
          team will contact you to schedule your consultation time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Row 1: Your name, Email address */}
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="name"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Your name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required={REQUIRED_FIELDS.name}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your full name"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="email"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Email address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required={REQUIRED_FIELDS.email}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter your email address"
            />
          </div>
        </div>

        {/* Row 2: Phone, Instagram user */}
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="phone"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              Phone Number (include country code) *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required={REQUIRED_FIELDS.phone}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="instagramUser"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              The Brand&apos;s Instagram User *
            </label>
            <input
              type="text"
              id="instagramUser"
              name="instagramUser"
              value={formData.instagramUser}
              onChange={handleChange}
              required={REQUIRED_FIELDS.instagramUser}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="@yourbrandhandle"
            />
          </div>
        </div>

        {/* Row 3: Revenue, Ad spend */}
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="revenueLastMonth"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              How much have your brand generated in revenue in the past month?
              (including currency) *
            </label>
            <input
              type="number"
              id="revenueLastMonth"
              name="revenueLastMonth"
              value={formData.revenueLastMonth}
              onChange={handleChange}
              required={REQUIRED_FIELDS.revenueLastMonth}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter last month's revenue (e.g. EGP 15000)"
            />
          </div>

          <div className="flex-1">
            <label
              htmlFor="adSpendLastMonth"
              className="text-textPrimary mb-2 block text-sm font-medium"
            >
              How much have you spend on ads in the past month? (including
              currency) *
            </label>
            <input
              type="number"
              id="adSpendLastMonth"
              name="adSpendLastMonth"
              value={formData.adSpendLastMonth}
              onChange={handleChange}
              required={REQUIRED_FIELDS.adSpendLastMonth}
              className="text-textPrimary focus:border-accentPrimary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
              placeholder="Enter last month's ad spend (e.g. EGP 5000)"
            />
          </div>
        </div>

        {/* Upcoming collections / updates */}
        <div>
          <label
            htmlFor="upcomingCollections"
            className="text-textPrimary mb-2 block text-sm font-medium"
          >
            Do you have any collections/updates for the brands releasing soon?
            If so please mention what the collection/update is about and the
            release date? *
          </label>
          <textarea
            id="upcomingCollections"
            name="upcomingCollections"
            value={formData.upcomingCollections}
            onChange={handleChange}
            required={REQUIRED_FIELDS.upcomingCollections}
            rows={4}
            className="text-textPrimary focus:border-accentPrimary w-full resize-none border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
            placeholder="Describe upcoming drops, campaigns, or updates and their planned release dates"
          />
        </div>

        {/* Additional notes */}
        <div>
          <label
            htmlFor="additionalNotes"
            className="text-textPrimary mb-2 block text-sm font-medium"
          >
            Additional notes
          </label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            value={formData.additionalNotes}
            onChange={handleChange}
            required={REQUIRED_FIELDS.additionalNotes}
            rows={4}
            className="text-textPrimary focus:border-accentPrimary w-full resize-none border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none"
            placeholder="Please share anything that will help prepare for our meeting."
          />
        </div>

        {/* Transaction Screenshot Upload */}
        <div>
          <label
            htmlFor="transactionScreenshot"
            className="text-textPrimary mb-2 block text-sm font-medium"
          >
            Transaction Screenshot * (Required for confirmation)
          </label>
          <p className="text-body mb-3 text-xs text-slate-400">
            Please upload a screenshot of your transaction payment to confirm
            your consultation request.
          </p>
          <input
            type="file"
            id="transactionScreenshot"
            name="transactionScreenshot"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="text-textPrimary focus:border-accentPrimary file:bg-accentPrimary hover:file:bg-accentSecondary w-full border-b border-white bg-transparent px-4 py-3 placeholder-slate-400 transition-colors outline-none file:mr-4 file:cursor-pointer file:rounded file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
          {transactionScreenshot && (
            <p className="mt-2 text-sm text-slate-400">
              Selected: {transactionScreenshot.name}
            </p>
          )}
        </div>

        {/* Submit button */}
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
        <div className="mt-6 rounded-lg border border-green-400 bg-green-400/10 p-4 text-sm text-green-400">
          <p className="mb-2 font-semibold">
            Thank you! Your form has been submitted successfully.
          </p>
          <p>
            Someone from our team will contact you shortly to schedule your
            consultation time.
          </p>
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
          After you submit this form with your transaction screenshot, someone
          from our team will review your submission and contact you within 24-48
          hours to schedule your consultation time.
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

export default DisqualifiedForm;
