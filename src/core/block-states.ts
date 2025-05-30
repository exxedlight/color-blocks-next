export enum Colors{
    red = "rgb(255, 0, 0)",
    green = "rgb(0, 255, 98)",
    blue = "rgb(17, 0, 255)",
    orange = "rgb(184, 110, 0)",
    violet = "rgb(255, 0, 191)",
    aqua = "rgb(0, 255, 221)",
    purple = "rgb(117, 8, 72)",
    yellow = "rgb(255, 217, 0)"
}
export enum States{
    Exist,
    Destroyed,
    Replace,
    Restored
}

export const getRandColor = (): Colors => {
    const colorValues = Object.values(Colors);
    const randomIndex = Math.floor(Math.random() * colorValues.length);
    return colorValues[randomIndex];
}