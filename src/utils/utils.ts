/**
 *  根据时间戳或时间日期字符串，格式化为对应的格式
 * @param date 时间字符串或时间戳
 * @param format 需要格式化成什么格式；如'yyyy-MM-DD HH:mm:ss'
 */
export const formatDate = (
  dateStr: number | string | Date,
  format?: string
) => {
  const strFormat = format || 'yyyy-MM-DD HH:mm:ss';
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 < 10
      ? '0' + (date.getMonth() + 1)
      : date.getMonth() + 1;
  const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  const hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  const minute =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  const second =
    date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();

  const dict: any = {
    yyyy: year,
    MM: month,
    DD: day,
    HH: hour,
    mm: minute,
    ss: second,
  };

  return strFormat.replace(/(yyyy|MM?|DD?|HH?|mm?|ss?)/g, function (e: string) {
    return dict[e];
  });
};
