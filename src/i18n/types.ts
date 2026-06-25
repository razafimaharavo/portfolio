export interface DegreeTranslation {
  degree: string;
  institution: string;
  yearLabel: string;
}

export interface CertificationTranslation {
  certification: string;
  centerLabel: string;
  dateLabel: string;
}

export interface ExperienceTranslation {
  role: string;
  periodLabel: string;
  description: string;
}

export interface ServiceTranslation {
  title: string;
  description: string;
  iconName: string;
  colorClass: string;
  iconColorClass: string;
}

export interface TranslationDictionary {
  header: {
    title: string;
    subtitle: string;
    home: string;
    about: string;
    skills: string;
    services: string;
    projects: string;
    contact: string;
    btnContact: string;
    weatherLoading: string;
    weatherNone: string;
  };
  hero: {
    badge: string;
    welcome: string;
    title: string;
    subtitle: string;
    btnCV: string;
    btnContact: string;
    liveApp: string;
    badge1: string;
    welcome1: string;
    title1: string;
    subtitle1: string;
    badge2: string;
    welcome2: string;
    title2: string;
    subtitle2: string;
    badge3: string;
    welcome3: string;
    title3: string;
    subtitle3: string;
  };
  about: {
    title: string;
    subtitle: string;
    degreesTitle: string;
    degreesSubtitle: string;
    certificationsTitle: string;
    certificationsSubtitle: string;
    experiencesTitle: string;
    experiencesSubtitle: string;
    skillsTitle: string;
    skillsSubtitle: string;
    present: string;
    degreesList: DegreeTranslation[];
    certificationsList: CertificationTranslation[];
    experiencesList: ExperienceTranslation[];
    skillsCategories: {
      frontend: string;
      backend: string;
      database: string;
      devops: string;
      cms: string;
      mobile: string;
      desktop: string;
    };
  };
  services: {
    title: string;
    subtitle: string;
    bentoHeader: string;
    list: ServiceTranslation[];
  };
  projects: {
    title: string;
    subtitle: string;
    mix: string;
    viewDetails: string;
    all: string;
    desktop: string;
    web: string;
    mobile: string;
    features: string;
    tech: string;
    github: string;
    demo: string;
    close: string;
    imageCounter: string;
    sourceCodeBtn: string;
    liveDemoBtn: string;
    aboutProjectHeader: string;
    techsHeader: string;
    featuresHeader: string;
    categoryLabel: string;
    p1Name: string;
    p1Short: string;
    p1Long: string;
    p1F1: string;
    p1F2: string;
    p1F3: string;
    p1F4: string;
    p2Name: string;
    p2Short: string;
    p2Long: string;
    p2F1: string;
    p2F2: string;
    p2F3: string;
    p2F4: string;
    p3Name: string;
    p3Short: string;
    p3Long: string;
    p3F1: string;
    p3F2: string;
    p3F3: string;
    p3F4: string;
    p4Name: string;
    p4Short: string;
    p4Long: string;
    p4F1: string;
    p4F2: string;
    p4F3: string;
    p4F4: string;
    p5Name: string;
    p5Short: string;
    p5Long: string;
    p5F1: string;
    p5F2: string;
    p5F3: string;
    p5F4: string;
    p6Name: string;
    p6Short: string;
    p6Long: string;
    p6F1: string;
    p6F2: string;
    p6F3: string;
    p6F4: string;
  };
  contact: {
    title: string;
    subtitle: string;
    badge: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    send: string;
    sending: string;
    success: string;
    validationName: string;
    validationEmail: string;
    validationSubject: string;
    validationMsg: string;
    nameLabel: string;
    emailLabel: string;
    subjectLabel: string;
    messageLabel: string;
    statusAvailable: string;
    location: string;
    expertiseLabel: string;
    successMessage: string;
    errorMessage: string;
    successLabel: string;
    errorLabel: string;
    testEnv: string;
    openInbox: string;
  };
  footer: {
    copy: string;
    tech: string;
  };
  razma: {
    welcome: string;
    weatherUpdate: string;
    weatherPrompt: string;
    micAlert: string;
    micIframeBlock: string;
    micIframeFix: string;
    micPermissionTitle: string;
    micPermissionDesc: string;
    micMissingTitle: string;
    micMissingDesc: string;
    micListening: string;
    micThinking: string;
    micSpeaking: string;
    micIdle: string;
    voiceClose: string;
    inputPlaceholder: string;
    errorServer: string;
    soundOn: string;
    soundOff: string;
    locDisable: string;
    locDetect: string;
  };
}
