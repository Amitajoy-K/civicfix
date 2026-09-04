import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Navigation, 
  Info, 
  RefreshCw,
  Building2,
  FileCheck2,
  Users
} from 'lucide-react';
import { AnalysisResult, CivicIssue, IssueCategory, User } from '../types';
import { SAMPLE_ISSUE_PHOTOS, CHENNAI_PRESET_LOCATIONS } from '../data/mockData';
import { analyzeIssueApi, createIssueApi } from '../services/api';
import { getPriorityColor } from '../utils/civicEngine';

interface ReportIssueWizardProps {
  currentUser: User;
  onCancel: () => void;
  onSuccess: (newIssue: CivicIssue) => void;
}

export const ReportIssueWizard: React.FC<ReportIssueWizardProps> = ({
  currentUser,
  onCancel,
  onSuccess
}) => {
  // Step: 1 (Photo) -> 2 (Location) -> 3 (Details) -> 4 (Smart Detection Screen)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [imageUrl, setImageUrl] = useState<string>(SAMPLE_ISSUE_PHOTOS[0].url);
  const [imageFileName, setImageFileName] = useState<string>('sample_pothole.jpg');
  
  const [latitude, setLatitude] = useState<number>(13.0850);
  const [longitude, setLongitude] = useState<number>(80.2101);
  const [address, setAddress] = useState<string>('5th Avenue, Anna Nagar East, Chennai 600040');
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [description, setDescription] = useState<string>('Large deep pothole in the road creating severe risk for two-wheelers.');
  const [manualCategory, setManualCategory] = useState<string>('Auto-detect');
  
  // Smart Analysis State
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STEP 1: PHOTO HANDLERS ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
          setImageFileName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSamplePhoto = (sample: typeof SAMPLE_ISSUE_PHOTOS[0]) => {
    setImageUrl(sample.url);
    setImageFileName(`${sample.label.toLowerCase().replace(/\s+/g, '_')}.jpg`);
    setDescription(sample.sampleDescription);
  };

  // --- STEP 2: LOCATION HANDLERS ---
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Unable to detect your location. Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        setAddress(`Detected Location: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E (Chennai Zone)`);
        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        setGeoError('Unable to detect your location automatically. Please select or enter it manually below.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPresetLocation = (preset: typeof CHENNAI_PRESET_LOCATIONS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setAddress(preset.address);
    setGeoError(null);
  };

  // --- STEP 3: ANALYZE ISSUE ---
  const handleAnalyzeIssue = async () => {
    if (!description.trim()) {
      setSubmitError('Please enter a description of the civic problem.');
      return;
    }

    setAnalyzing(true);
    setSubmitError(null);

    try {
      const result = await analyzeIssueApi({
        description,
        categoryHint: manualCategory !== 'Auto-detect' ? manualCategory : undefined,
        latitude,
        longitude
      });
      setAnalysisResult(result);
      setStep(4); // Move to Smart Issue Detection Screen
    } catch (err: any) {
      setSubmitError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  // --- STEP 4: FINAL SUBMISSION ---
  const handleFinalSubmit = async () => {
    if (!analysisResult) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await createIssueApi({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        category: analysisResult.category,
        title: analysisResult.suggestedTitle,
        description,
        imageUrl,
        latitude,
        longitude,
        address,
        priority: analysisResult.priority,
        priorityReason: analysisResult.reason,
        departmentId: analysisResult.departmentId
      });

      onSuccess(res.issue);
    } catch (err: any) {
      setSubmitError(err.message || 'Unable to submit your complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 sm:px-6">
      {/* Wizard Header & Progress Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-display">
              Report an Issue
            </h1>
            <p className="text-xs text-slate-500">Fast geo-tagged complaint dispatch to municipal departments</p>
          </div>
          <button
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            id="wizard-cancel-btn"
          >
            Cancel
          </button>
        </div>

        {/* Progress Bar Indicator: 1 Photo -> 2 Location -> 3 Details -> 4 Analysis */}
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex items-center gap-2 bg-white pr-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
              Photo
            </span>
          </div>

          <div className="relative z-10 flex items-center gap-2 bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
              Location
            </span>
          </div>

          <div className="relative z-10 flex items-center gap-2 bg-white pl-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
              step >= 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
            }`}>
              3
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
              Details
            </span>
          </div>
        </div>
      </div>

      {submitError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* --- STEP 1: PHOTO --- */}
      {step === 1 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Step 1 – Photo Evidence</h2>
            <p className="text-xs text-slate-500 mb-4">
              Clear photos enable our classification model and municipal inspectors to verify the hazard quickly.
            </p>

            {/* Photo Preview Card */}
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-4 group aspect-video sm:aspect-2/1">
                <img
                  src={imageUrl}
                  alt="Issue Preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    Replace Photo
                  </button>
                  <button
                    onClick={() => { setImageUrl(''); setImageFileName(''); }}
                    className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Remove Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md">
                  ✓ Photo Loaded: {imageFileName}
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 transition-all cursor-pointer mb-4"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Upload or Capture Image</p>
                <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />

            {/* Quick Demo Pre-selected Civic Photos */}
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2">Or click a sample civic defect photo:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {SAMPLE_ISSUE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSamplePhoto(sample)}
                    className={`relative rounded-lg overflow-hidden border p-1 text-left transition-all ${
                      imageUrl === sample.url ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/40' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img src={sample.url} alt={sample.label} className="w-full h-12 object-cover rounded-md" referrerPolicy="no-referrer" />
                    <span className="block text-[10px] font-medium text-slate-700 truncate mt-1 text-center">
                      {sample.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                if (!imageUrl) {
                  setSubmitError('Please upload or select an image for this complaint.');
                  return;
                }
                setSubmitError(null);
                setStep(2);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all"
              id="step-1-next-btn"
            >
              <span>Continue to Location</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 2: LOCATION --- */}
      {step === 2 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Step 2 – Incident Location</h2>
            <p className="text-xs text-slate-500 mb-4">
              Pinpoint the exact location so dispatch crews can reach the site without delay.
            </p>

            {/* Geolocation Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={geoLoading}
                className="w-full py-2.5 px-4 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-xs"
                id="geo-current-location-btn"
              >
                {geoLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                ) : (
                  <Navigation className="w-4 h-4 text-blue-600" />
                )}
                <span>{geoLoading ? 'Detecting GPS Coordinates...' : 'Use Current Location (GPS)'}</span>
              </button>
            </div>

            {geoError && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{geoError}</span>
              </div>
            )}

            {/* Coordinate Display Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Latitude</span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">{latitude.toFixed(5)}° N</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Longitude</span>
                <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">{longitude.toFixed(5)}° E</p>
              </div>
            </div>

            {/* Address Input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detected / Manual Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Landmark, Ward / Locality, City"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  id="location-address-input"
                />
              </div>
            </div>

            {/* Quick Chennai Locality Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-2">
                Quick Select Chennai Ward Presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CHENNAI_PRESET_LOCATIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetLocation(preset)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium border transition-colors ${
                      address === preset.address
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    📍 {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm"
              id="step-2-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => {
                if (!address.trim()) {
                  setSubmitError('Please enter an address or landmark.');
                  return;
                }
                setSubmitError(null);
                setStep(3);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all"
              id="step-2-next-btn"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 3: ISSUE DETAILS --- */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Step 3 – Issue Description</h2>
            <p className="text-xs text-slate-500 mb-4">
              Describe what is broken. The CivicFix classification engine analyzes your text to automatically determine category, priority, and the responsible department.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description of Defect
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Large pothole spanning 1.5 meters causing difficulty for vehicles and safety risk for two-wheelers."
                className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                id="issue-description-input"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Include details like dimensions, hazards near schools/hospitals, or leaking duration.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Selection (Optional)
              </label>
              <select
                value={manualCategory}
                onChange={(e) => setManualCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                id="issue-category-select"
              >
                <option value="Auto-detect">⚡ Auto-detect with CivicFix AI / Rule Engine</option>
                <option value="Road Damage">Road Damage (Pothole, broken asphalt)</option>
                <option value="Waste Management">Waste Management (Garbage, overflowing bins)</option>
                <option value="Street Lighting">Street Lighting (Darkness, broken lamps)</option>
                <option value="Water Supply">Water Supply (Pipeline leak, sewage)</option>
                <option value="Tree Hazard">Tree Hazard (Fallen tree, hanging limb)</option>
                <option value="Road Signage">Road Signage (Bent sign, obscured warnings)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm"
              id="step-3-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={handleAnalyzeIssue}
              disabled={analyzing}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-all active:scale-[0.98]"
              id="analyze-issue-btn"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Issue...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-200" />
                  <span>Analyze Issue</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- STEP 4: SMART ISSUE DETECTION SCREEN --- */}
      {step === 4 && analysisResult && (
        <div className="space-y-5 animate-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl border-2 border-blue-500/30 p-6 shadow-md relative overflow-hidden">
            {/* Top Verification Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  ✓ Issue Detected & Classified
                </span>
                <h2 className="text-base font-bold text-slate-900 font-display">
                  {analysisResult.suggestedTitle}
                </h2>
              </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {/* Category */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Category
                </span>
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {analysisResult.categoryDetail || analysisResult.category}
                </p>
              </div>

              {/* Priority */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Calculated Priority
                </span>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border ${getPriorityColor(analysisResult.priority).badge}`}>
                    {analysisResult.priority} Priority
                  </span>
                </div>
              </div>

              {/* Department */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Assigned Department
                </span>
                <p className="text-xs font-bold text-blue-700 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{analysisResult.departmentName}</span>
                </p>
              </div>
            </div>

            {/* Classification Reasoning */}
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 mb-5">
              <span className="font-bold text-blue-900 block mb-1">Detection Logic & Risk Justification:</span>
              <p className="leading-relaxed">{analysisResult.reason}</p>
            </div>

            {/* Duplicate Notice Banner (Section 11) */}
            {analysisResult.isDuplicateNearby && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 mb-5">
                <Users className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Duplicate Cluster Corroboration:</span>
                  <p className="mt-0.5 leading-relaxed">
                    A matching complaint ({analysisResult.nearbyMatchCount} prior reports) is already active within 350m. Submitting this will corroborate the ticket, elevating municipal dispatch priority!
                  </p>
                </div>
              </div>
            )}

            {/* Summary Details */}
            <div className="text-xs text-slate-500 space-y-1.5 pt-2 border-t border-slate-100">
              <p><span className="font-semibold text-slate-700">Location:</span> {address}</p>
              <p><span className="font-semibold text-slate-700">Citizen Reporter:</span> {currentUser.name} ({currentUser.email})</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm"
              id="step-4-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Details</span>
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
              id="submit-complaint-btn"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating Municipal Ticket...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4 text-blue-400" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
