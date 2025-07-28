export interface Helper {
  _id?: string;
  employeeCode?: string;
  serviceType: string;
  organization: string;
  fullName: string;
  gender: string;
  phno: number;
  email?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  docType: string;
  kycdoc: string;
  photoURL?: string;
  languages: string[];
  joinedOn?: string;
}