const catchAsync = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        fn(req, res, next).catch((err: Error) => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
    };
}

export default catchAsync; 