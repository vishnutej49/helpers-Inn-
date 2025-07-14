
export interface Helper {
  _id?: string; 
  serviceType: string;
  organization: string;
  name: string;
  gender: string;
  phone: number;
  email?: string;
  vehicleType?: string;
  documentType: string;
  kycDocURL: string;
  photoURL?: string;
  languages: string[];
}

