import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/services/api";
import { toast } from "sonner";

const UserDialog = ({ open, onOpenChange, user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm();
  const [role, setRole] = useState("staff");

  useEffect(() => {
    if (user) {
      setValue("username", user.username);
      setValue("name", user.name);
      setRole(user.role);
    } else {
      reset();
      setRole("staff");
    }
  }, [user, reset, setValue, open]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const payload = { ...data, role };

      if (user) {
        // Edit mode (Note: Password is optional in edit)
        if (!payload.password) delete payload.password;
        await api.put(`/api/users/${user._id}`, payload);
        toast.success("Cập nhật người dùng thành công");
      } else {
        // Create mode
        await api.post("/api/users", payload);
        toast.success("Tạo người dùng thành công");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {user ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input
              id="username"
              disabled={!!user} // Không cho sửa username
              {...register("username", { required: true })}
              placeholder="VD: nv_banhang"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Tên hiển thị</Label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="VD: Nguyễn Văn A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {user ? "Mật khẩu (Để trống nếu không đổi)" : "Mật khẩu"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password", { required: !user })}
              placeholder={user ? "********" : "Nhập mật khẩu"}
            />
          </div>

          <div className="space-y-2">
            <Label>Vai trò</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Nhân viên (Staff)</SelectItem>
                <SelectItem value="admin">Quản trị viên (Admin)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : user ? "Cập nhật" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
