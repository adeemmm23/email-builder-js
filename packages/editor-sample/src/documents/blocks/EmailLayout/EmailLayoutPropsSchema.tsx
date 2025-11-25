import { z } from 'zod';

import { zColor, zFontFamily, zPadding } from '../helpers/zod';

const EmailLayoutPropsSchema = z.object({
  backdropColor: zColor().optional().nullable(),
  borderColor: zColor().optional().nullable(),
  borderRadius: z.number().optional().nullable(),
  canvasColor: zColor().optional().nullable(),
  textColor: zColor().optional().nullable(),
  fontFamily: zFontFamily().optional().nullable(),
  padding: zPadding().optional().nullable(),
  childrenIds: z.array(z.string()).optional().nullable(),
});

export default EmailLayoutPropsSchema;

export type EmailLayoutProps = z.infer<typeof EmailLayoutPropsSchema>;
