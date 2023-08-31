export class CreateProfileDto {
  constructor(
    public uId: string,
    public userName: string,
    public displayName: string,
    public email: string,
    public country: string,
    public avatar: string,
    public gender: string,
    public courses: string[],
    public bio: string,
    public notifications: string[],
    public messages: string[],
    public role: string
  ) { }
}
