declare module "*.vert" {
    const shader: string
    export = shader;
}

declare module "*.frag" {
    const shader: string
    export = shader;
}

declare module "*.png";
 
declare module "*.png" {
    const value: any;
    export default value;
}
 
declare module "*.jpg" {
    const value: any;
    export default value;
}

declare module "*.jpeg" {
    const value: any;
    export default value;
}

declare module "*.obj" {
    const value: any;
    export default value;
}