export interface IPostData {
    title: string;
    contentFile: string;
    author: string;
    summary?: string;
    categories?: string[];
}

export interface ICategoryData {
    name: string;
    children?: ICategoryData[];
}

export interface ContentConfig {
    fixture?: {
        categories: ICategoryData[];
        posts: IPostData[];
    };
}
